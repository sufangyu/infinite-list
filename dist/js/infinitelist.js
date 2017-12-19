(function(window, document, $, undefined) {
  'use strict';

  // If there's no jQuery or Zepto, it can't work
  if (!$) {
    void 0;
    return;
  }

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */
  var NAME               = 'infiniteList';
  var VERSION            = '1.0.0-beta';
  var DATA_KEY           = 'yu.infiniteList';
  var EVENT_KEY          = '.' + DATA_KEY;
  var DATA_API_KEY       = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];


  var Event = {
    SCROLL : 'scroll' + EVENT_KEY,
    CLICK : 'click' + EVENT_KEY,
  };


  /**
   * ------------------------------------------------------------------------
   * Defaults
   * ------------------------------------------------------------------------
   */
  var Default = {
    wrapper: '.infinite-list', // 列表容器
    listData: [], // 列表数据
    offset: 10,  // 触发加载下一页的相对底部距离
    activeIndex: 0, // 定位 Item index
    rowHeight: 58, // Item 的高度
    isInfinite: false, // 是否是无限下拉列表
    itemTemplate: function(res) { // 列表 Item 的 HTML
      var data = typeof res === 'object' ? JSON.stringify(res) : res;
      return '<div class="infinite-list__item">'+ data +'</div>';
    },
    loadStatusTemplate: { // 状态 HTML
      loaded: function() {
        return '<span>加载更多</span>';
      },
      loading: function() {
        return '<span>加载中...</span>';
      },
      loadFail: function() {
        return '<span>加载失败, 请点击重试</span>';
      },
      loadEnd: function() {
        return '<span>没有更多了</span>';
      },
    },
    onInfinite: function() {}, // 加载下一页触发
  };

  var DefaultType = {
    listData : 'array',
    wrapper  : '(string|element)',
    offset   : 'number',
    activeIndex: 'number',
    rowHeight: 'number',
    isInfinite: 'boolean',
    itemTemplate: 'function',
    loadStatusTemplate: 'boject',
    onInfinite: 'function',
  };

  

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */
  function Infinite(element, options) {
    var _this = this;

    _this.settings = $.extend({}, $.fn[NAME].defaults, options || {});
    _this._element = element;
    _this._scrollElement = element.is('body') ? window : element;

    _this._init();
  }

  Infinite.prototype = {
    constructor: Infinite,
    _init: function() {
      var _this = this;

      _this.$scrollElenent = $(_this._scrollElement); // 滚动元素
      _this.$wrapper    = $(_this.settings.wrapper);  // 列表容器
      _this.$listContent = $('<div class="infinite-list__content">');
      _this.$listHeader = $('<div class="infinite-list__header">');
      _this.$listBody   = $('<div class="infinite-list__body">');
      _this.$listFooter = $('<div class="infinite-list__footer">');
      _this.$listStatus = $('<div class="infinite-list__status">');

      _this._data = _this.settings.listData;  // 列表的全部数据
      _this._previewData = [];      // 当前的列表数据
      _this._lineTopHeight = 0;     // 顶部已滚动距离
      _this._lineBottomHeight = 0;  // 底部未滚动距离
      _this._from = 0;
      _this._to = 0;
      _this._displayCount = 0;      // 已超出隐藏的数量
      _this._activeIndex = _this.settings.activeIndex; // 定位 Item 序号
      _this._loadStatus = _this.settings.isInfinite ? 'loaded' : 'loadEnd';  // 加载状态 'loaded', 'loading', 'loadFail', 'loadEnd'
      _this._lastScrollTop = 0; // 最后一次滚动停留的位置

      _this._wrapperHeight = _this.$wrapper.height(); // 容器高度
      _this._rowHeight = _this.settings.rowHeight;    // item 高度
      _this._rowsInWindow = Math.ceil(_this._wrapperHeight / _this._rowHeight); // 可视区域内可显示 item 数量
      _this._above = _this._rowsInWindow * 2; // 可视区域上方. 一般高度为当前可视区域高度的2倍
      _this._below = _this._rowsInWindow; // 可视区域下方
      // _this._max = _this._rowsInWindow * _this._rowHeight;   // 可视区域的最大高度
      _this.locateTimer = null;

      _this._renderBaseDOM();
      _this._showPreviewList(_this._activeIndex);
      _this._bindEvents();
    },
    _bindEvents: function() {
      var _this = this;
      var timer = null;


      // 滚动事件
      _this.$scrollElenent.on(Event.SCROLL, function (ev) {
        ev.stopPropagation();

        // 函数节流. 也同时解决 MiPad Google 浏览器在 push 新内容渲染后滚动条会回滚到顶部问题
        if (timer) {
          return;
        }

        timer = setTimeout(function() {
          clearTimeout(timer);
          timer = null;
          _this._showPreviewList();
        }, 50);
      });


      // 状态点击事件
      _this.$listStatus.on(Event.CLICK, function () {
        if (_this._loadStatus !== 'loadFail') {
          return;
        }
        _this.setLoadStatus('loading');

        if (typeof _this.settings.onInfinite === 'function') {
          _this.settings.onInfinite(_this);
        }
      });
    },
    /**
     * 显示可视窗口列表
     */
    _showPreviewList: function(index) {
      var _this = this;

      // if (_this._data.length === 0) {
      //   return;
      // }
      
      // 有设置定位 index, 执行定位
      if (index !== undefined) {
        _this.locate(index);
      }

      var _scrollTop = _this.$scrollElenent.scrollTop(); // 滚动条已滚动距离
      _this._lastScrollTop = _scrollTop;
      var _wrapperHeight = _this.$wrapper.height(); // 容器高度
      var _contentHeight = _this.$listContent.height();  // 列表内容的总高度
      // var _height = _this.$listContent.height();  // 列表内容的高度
      var _maxScroll = _contentHeight - _wrapperHeight;

      _scrollTop += _this.settings.offset;

      // 如果滚动元素是 window, 则已滚动距离需要减去列表的位置 top 值
      if (_this._scrollElement === window) {
        var _wrapperOffsetTop = _this.$wrapper.position().top; // 容器元素的位置
        _scrollTop = _scrollTop - _wrapperOffsetTop;
      }
      
      // 计算已隐藏的数量.
      var _displayCount = _scrollTop / _this._rowHeight; // 已经显示的 item 数量
      // 超过一半: 向上取整; 反之: 向下取整;
      if (_displayCount - Math.floor(_displayCount) > 0.5) {
        _this._displayCount = Math.ceil(_displayCount);
      } else {
        _this._displayCount = Math.floor(_displayCount);
      }

      // 根据已经滚动的距离, 获取当前的列表数据的 from 和 to
      _this._from = _this._getRange(_scrollTop).from;
      _this._to = _this._getRange(_scrollTop).to;

      // 获取新的 topHeight 和 bottomHeight
      _this._lineTopHeight = _this._from * _this._rowHeight;
      _this._lineBottomHeight = (_this._data.length - _this._to) * _this._rowHeight;

      // 重新渲染列表
      _this._reRenderPreviewList(_this._from, _this._to);


      // 判断是否加载下一页
      // 滚动距离 - top 位置 >= 内容高度 - 容器高度
      if (_scrollTop >= _maxScroll) {
        if (_this._loadStatus === 'loading' || _this._loadStatus === 'loadEnd') {
          return;
        }
        _this.setLoadStatus('loading');

        if (typeof _this.settings.onInfinite === 'function') {
          _this.settings.onInfinite(_this);
        }
      }

    },
    /**
     * 重新渲染可视窗口的列表
     * 
     * @param {any} from 
     * @param {any} to 
     */
    _reRenderPreviewList: function(from, to) {
      var _this = this;

      // 重新设置 previewList (当前的列表数据)
      _this._previewData = [];
      for (var i = from; i < to; i++) {
        _this._previewData.push(_this._data[i]);
      }

      _this._renderList(_this._previewData);
      _this._resetStyle();
    },
    /**
     * 渲染列表 DOM
     * 
     * @param {any} data 
     */
    _renderList: function(data) {
      var _this = this;
      _this.$listBody.html(_this._getListsContentHtml(data));
    },
    /**
     * 获取全部列表单项的 HTML 字符串
     * @param data
     * @returns {string}
     * @private
     */
    _getListsContentHtml: function(data) {
      var _this = this;
      var listsHtmlArr = [];
      for (var i = 0; i < data.length; i++) {
        var rowItemHtml = _this.settings.itemTemplate(data[i]);

        listsHtmlArr.push(rowItemHtml);
      }
      return listsHtmlArr.join('');
    },
    /**
     * 设置加载状态
     * 
     * @param {any} statusCode 
     */
    setLoadStatus: function(statusCode) {
      var _this = this;

      // 当前加载状态 与 设置状态相同, 不执行设置
      if (_this._loadStatus === statusCode) {
        return;
      }

      var setStatus = {
        loaded: function() {
          _this.$listStatus.html(_this.settings.loadStatusTemplate.loaded());
        },
        loading: function() {
          _this.$listStatus.html(_this.settings.loadStatusTemplate.loading());
        },
        loadFail: function() {
          _this.$listStatus.html(_this.settings.loadStatusTemplate.loadFail());
        },
        loadEnd: function() {
          _this.$listStatus.html(_this.settings.loadStatusTemplate.loadEnd());
        },
      };

      setStatus[statusCode]();
      _this._loadStatus = statusCode;
    },
    /**
     * 重置列表顶部已滚动的高度 和 底部未滚动的高度
     */
    _resetStyle: function () {
      var _this = this;

      _this.$listContent.css({
        'padding-top': _this._lineTopHeight,
        'padding-bottom': _this._lineBottomHeight,
      });
    },
    /**
     * 获取当前可视窗口数据的 from 与 to 的区间
     * 
     * @param {any} scrollTop 
     */
    _getRange: function(scrollTop) {
      var _this = this;

      // 已滚动显示的 item 数量 - 可视区域上方数量
      var _from = parseInt(scrollTop / _this._rowHeight) - _this._above;
      if (_from < 0) {
        _from = 0;
      }

      // _from + 一页可显示的 item 数量( above + below + screen )
      var _to = _from + _this._above + _this._below + _this._rowsInWindow;
      if (_to > _this._data.length) {
        _to = _this._data.length;
      }

      return {
        from: _from,
        to: _to,
      };
    },
    /**
     * 添加新数据 
     * 
     * @param {any} data 
     */
    pushData: function(data) {
      var _this = this;

      _this._data.push.apply(_this._data, data);
      _this._showPreviewList(_this._activeIndex);

      setTimeout(function() {
        _this.$scrollElenent.scrollTop(_this._lastScrollTop);
      }, 10);
    },
    /**
     * 定位到列表某项
     * 
     * @param {any} index 
     */
    locate: function(index) {
      var _this = this;

      // 修改配置项的 index
      _this.settings.activeIndex = parseInt(index);

      var scrolledDistance = _this.$scrollElenent.scrollTop(); // 已滚动距离
      var locateDistance = index * _this._rowHeight; // 需要定位到的距离

      if (locateDistance !== scrolledDistance) {
        clearTimeout(_this.locateTimer);
        _this.locateTimer = setTimeout(function () {
          _this.$scrollElenent.scrollTop(locateDistance);
        }, 0);
      }
    },
    /**
     * 渲染基础结构 DOM
     * 
     * 先渲染基础结构, 以解决 Firefox 和 手机端 Chrome 滚动时会不断回滚到顶部
     */
    _renderBaseDOM: function() {
      var _this = this;

      var statusHtml = _this.settings.isInfinite ? _this.settings.loadStatusTemplate.loaded() : _this.settings.loadStatusTemplate.loadEnd();
      
      _this.$listStatus.append(statusHtml);
      _this.$listFooter.append(_this.$listStatus);

      _this.$listContent.append(_this.$listHeader);
      _this.$listContent.append(_this.$listBody);
      _this.$listContent.append(_this.$listFooter);

      _this.$wrapper.append(_this.$listContent);
    },
  };


  
  /**
   * ------------------------------------------------------------------------
   * Plugin
   * ------------------------------------------------------------------------
   */
  $.fn[NAME] = function(options) {
    var _this = this;
    var obj;

    return this.each(function(){
        var $this = $(this);
        var instance = window.jQuery ? $this.data(NAME) : $.fn[NAME].lookup[$this.data(NAME)];
        
                    
        if (!instance) {
          obj = new Infinite($this, options);

          if (window.jQuery) {
            $this.data(NAME, obj);
          } else {
            $.fn[NAME].lookup[++$.fn[NAME].lookup.i] = obj;
            $this.data(NAME, $.fn[NAME].lookup.i);
            instance = $.fn[NAME].lookup[$this.data(NAME)];
          }
        } else {
          obj = new Infinite($this, options);
        }

        if (typeof options === 'string') { 
          instance[options]();
        }

        // 提供外部调用公共方法
        _this.pushData = function(data){
          obj.pushData(data);
        };
        _this.setLoadStatus = function(status){
          obj.setLoadStatus(status);
        };
        _this.locate = function(index){
          obj.locate(index);
        };
      });
  };

  if (!window.jQuery) {
    $.fn[NAME].lookup = {i: 0};
  }

  
  $.fn[NAME].defaults = Default;


  return Infinite;

})(window, document, window.jQuery || window.Zepto);