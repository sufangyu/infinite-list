# infinite-list

infinite-list 是可回收 DOM 的无限下拉列表插件, 支持 jQuery 和 Zepto 库。[点击此预览](https://sufangyu.github.io/project/infinite-list/index.html)


### 特性
+ 利用 DOM 回收, 解决多数据列表导致的卡顿
+ 支持下拉加载下一页数据
+ 可定位到列表置顶
+ 可自定义列表项的 HTMl 结构
+ 同时支持 jQuery 和 Zepto 库



### 兼容性
+ Android 4.0+
+ iOS 8+


### 示例
+ [默认滚动元素](https://sufangyu.github.io/project/infinite-list/demos/body.html)
+ [默认滚动元素 - 图片](https://sufangyu.github.io/project/infinite-list/demos/bodypost.html)
+ [指定滚动元素](https://sufangyu.github.io/project/infinite-list/demos/element.html)
+ [指定滚动元素 - 图片](https://sufangyu.github.io/project/infinite-list/demos/elementpost.html)
+ [无限下拉列表](https://sufangyu.github.io/project/infinite-list/demos/infinite.html)
+ [指定跳转某个 Item](https://sufangyu.github.io/project/infinite-list/demos/locate.html)


### 安装与使用
```
# 安装依赖
npm install

# 开发
gulp dev

# 打包发布
gulp build
```


### 参数
<table>
  <thead>
    <tr>
      <th>参数</th>
      <th>默认值</th>
      <th>说明</th>
    </tr>                           
  </thead>
  <tbody>
    <tr>
      <td>wrapper</td>
      <td>.infinite-list'</td>
      <td>列表容器</td>
    </tr>
    <tr>
      <td>listData</td>
      <td>[]</td>
      <td>列表数据</td>
    </tr>
    <tr>
      <td>offset</td>
      <td>10</td>
      <td>触发加载下一页的相对底部距离</td>
    </tr>
    <tr>
      <td>activeIndex</td>
      <td>0</td>
      <td>定位 Item index</td>
    </tr>
    <tr>
      <td>rowHeight</td>
      <td>58</td>
      <td>Item 的高度</td>
    </tr>
    <tr>
      <td>isInfinite</td>
      <td>false</td>
      <td>是否是无限下拉列表</td>
    </tr>
    <tr>
      <td>itemTemplate</td>
      <td>*</td>
      <td>列表 Item 的 HTML</td>
    </tr>
    <tr>
      <td>loadStatusTemplate</td>
      <td>*</td>
      <td>状态 HTML</td>
    </tr>
  </tbody>
</table>


### 回调函数
<table>
  <thead>
  <tr>
    <th>函数</th>
    <th>默认值</th>
    <th>说明</th>
    </tr>                           
  </thead>
  <tbody>
    <tr>
      <td>onInfinite</td>
      <td>function(){}</td>
      <td>加载下一页触发</td>
    </tr>
  </tbody>
</table>



### 方法
<table>
  <thead>
    <tr>
      <th>方法</th>
      <th>说明</th>
    </tr>                           
  </thead>
  <tbody>
    <tr>
      <td>obj.pushData()</td>
      <td>
        添加数据
        <br />pushData.close([1, 2, 3]);
      </td>
    </tr>
    <tr>
      <td>obj.setLoadStatus(status)</td>
      <td>
        设置列表加载状态<br />
        可传入参数：<br>
        'loaded': 弹窗内容, 可以是HTML <br>
        'loading': 弹窗提示图标<br>
        'loadFail': 弹窗提示文字<br>
        'loadEnd': 自动关闭的延迟时间<br>
      </td>
    </tr>
    <tr>
      <td>obj.locate(index)</td>
      <td>
        列表定位到置顶 Item<br />
        可传入参数：<br>
        index: Item 序号 <br>
      </td>
    </tr>
  </tbody>
</table>


### 目录结构
```
.
├─ dist                    # 项目发布资源目录, gulp 生成
│
├─ gulp
│   ├─ build.task.js       # 打包任务
│   ├─ clean.task.js       # 删除任务
│   ├─ dev.task.js         # 开发任务
│   ├─ gulp.config.js      # gulp 配置
│   ├─ help.task.js        # 帮助任务
│   ├─ server.task.js      # 本地服务器任务
│   └─ watch.task.js       # 监听任务
│
├─ src
│   ├─ css                 # 项目 CSS 文件, 由 gulp 生成
│   ├─ demos               # 项目示例页面
│   ├─ images              # 项目 image 文件
│   ├─ js                  # 项目 JS 文件
│   │  └─ infinitelist.js  # 无限列表 JS
│   ├─ libs                # 公共 JS 文件
│   ├─ scss                # 项目相关 SCSS 文件
│   ├─ index.html          # 入口页
│   └─ templates           # 初始静态 DMEO 资源目录
│
├─ gulpfile.js             # gulp 任务配置
└─ package.json            # 项目信息以及依赖
```