/**
 * build task
 * @param {Object} gulp
 * @param {Object} config      配置
 * @param {Object} $           插件集合
 * @param {Object} runSequence 按顺序执行任务插件
 * @param {Object} pngquant    图片深度压缩插件
 * @param {Object} argv        获命令行中参数插件
 */
module.exports = function(gulp, config, $, runSequence, pngquant, argv) {

  const buildTask = {
    /**
     * 打包 Html
     * @param src
     * @param dist
     * @param debug 是否是调试模式
     */
    html: function (src, dist, unref, debug) {
      return gulp.src(src)
        .pipe($.if( !unref, $.useref({ base: process.cwd() }) ))        // 使用 HTMl 注释合并 JS, CSS 文件
        .pipe($.if( !unref && !debug, $.if('*.js', $.uglify()) ))       // 压缩 JS
        .pipe($.if( !unref && !debug, $.if('*.js', $.stripDebug(/alert*/)) ))   // 删除 JS 文件中的调试语句(alert, console.log...)
        .pipe($.if( !unref && !debug, $.if('*.css', $.cleanCss()) ))    // 压缩 CSS
        .pipe(gulp.dest(dist));
    },
    /**
     * 打包 CSS
     * @param src
     * @param dist
     * @param debug 是否是调试模式
     */
    css: function(src, dist, debug) {
      return gulp.src(src)
        .pipe(gulp.dest(dist))
        .pipe($.rename({suffix: '.min'}))    // rename 压缩后的文件名
        .pipe($.cleanCss({ rebase: false })) // 执行压缩
        .pipe(gulp.dest(dist))
    },
    /**
     * 打包 JS
     * @param src
     * @param dist
     * @param debug 是否是调试模式
     */
    js: function(src, dist, debug) {
      return gulp.src(src)
        .pipe($.if( !debug, $.stripDebug() ))   // 删除 JS 文件中的调试语句(alert, console.log...)
        .pipe(gulp.dest(dist))
        .pipe($.rename({suffix: '.min'}))    // rename 压缩后的文件名
        .pipe($.uglify()) // 执行压缩
        .pipe(gulp.dest(dist))
    },
    /**
     * 打包 IMG
     * @param src
     * @param dist
     */
    image: function(src, dist) {
      // 使用 pngquant 深度压缩png图片
      const options = {
        use: [pngquant()],
      };

      return gulp.src(src)
        .pipe($.imagemin())
        .pipe(gulp.dest(dist));
    },
    /**
      * 打包公共资源 与 第三方库
      * @param src
      * @param dist
      * @param min 是否压缩图片
      */
    common: function(src, dist, debug, min) {
      // 判断是否是图片资源
      const isImage = function(file) {
        const path = file.path;
        if (path.lastIndexOf(".") > 0) {
          const extName  = path.substr(path.lastIndexOf(".")).toLowerCase();  // 获得文件后缀名
          return (/\.(gif|jpg|jpeg|png|svg)$/.test(extName));
        } else {
          return false;
        }
      };

      // 使用 pngquant 深度压缩 png 图片
      const options = {
        use: [pngquant()]
      };

      return gulp.src(src, { base: config.src })
        .pipe($.if( isImage && min, $.imagemin() ))  // 压缩图片
        .pipe(gulp.dest(dist));
    },
  };

  // 获取打包任务列表
  function getBuildTaskList(options) {
    // 任务列表
    const list = [];

    (function() {
      const srcDir = `${config.src}`;
      const distDir = `${config.dist}`;

      gulp.task('_html', function() {
        const src = [`${srcDir}/**/*.html`];
        const dist = `${distDir}`;

        return buildTask.html(src, dist, options.unref, options.debug);
      });

      gulp.task('_js', function() {
        const src = [`${srcDir}/**/*.js`, `!${srcDir}/libs/**/*.js`];
        const dist = `${distDir}`;

        return buildTask.js(src, dist, options.debug);
      });

      gulp.task('_css', function() {
        const src = [`${srcDir}/**/*.css`];
        const dist = `${distDir}`;

        return buildTask.css(src, dist, options.debug);
      });

      gulp.task('_image', function() {
        const src = [`${srcDir}/**/*.{png,jpg,gif,ico,svg}`];
        const dist = `${distDir}`;

        return buildTask.image(src, dist);
      });

      gulp.task('_libs', function () {
        const src = [`${srcDir}/libs/**/*.*`, `!${srcDir}/libs/**/_*.*`];
        const dist = `${distDir}`;

        return buildTask.common(src, dist);
      });

      // 生成打包任务
      gulp.task('_module', function() {        
        runSequence('_html', '_js', '_css', '_libs', '_image');
      });
    })();

    list.push('_module');
    return list;
  }


  // 项目打包
  gulp.task('build', function() {
    const options = {
        debug: argv.debug || false, // 是否调试模式, 默认为 false.            =>> 参数: --debug
        unref: argv.unref || false, // 是否不使用 useref 合并, 默认为 false.  =>> 参数: --unref
    };

    // 获取要 build 的模块任务列表
    const taskList = getBuildTaskList(options);

    if (taskList.length) {
        runSequence('clean', taskList);
    }
  });

};