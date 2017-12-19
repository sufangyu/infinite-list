/**
 * watch task
 * @param {Object} gulp
 * @param {Object} config 配置
 * @param {Object} $      插件集合
 */
module.exports = function (gulp, config, $) {
  // task
  const watchTask = {
    html: function(file) {
      return gulp.src(file)
        .pipe($.connect.reload());
    },
    js: function(file) {
      return gulp.src(file)
        .pipe($.jshint()) // JS 代码语法检查
        .pipe($.jshint.reporter('default'))  // 对代码进行报错提示
        .pipe($.connect.reload());
    },
    image: function(file) {
      return gulp.src(file)
        .pipe($.connect.reload());
    },
    css: function(file) {
      return gulp.src(file)
        .pipe($.connect.reload());
    },
    sass: function(file, dir) {
      return gulp.src(file)
          .pipe($.sass().on('error', $.sass.logError))
          .pipe($.autoprefixer({
              cascade: true,   // 是否美化属性值
              remove: false    // 是否去掉不必要的前缀.
          }))
          .pipe(gulp.dest(dir))
          .pipe($.connect.reload());
    },
  };

  gulp.task('watch', function() {
    // 监听 HTML 文件
    gulp.watch(`${config.src}/**/*.html`, function(ev) {
      const file = ev.path;
      watchTask.html(file);
    });

    // 监听 JS
    gulp.watch([`${config.src}/**/*.js`, `!${config.src}/libs/**/*.js`], function(ev) {
      const file = ev.path;
      watchTask.js(file);
    });

    // 监听 Image
    gulp.watch(`${config.src}/**/*.{png,jpg,gif,ico,svg}`, function(ev) {
      const file = ev.path;
      watchTask.image(file);
    });

    // 监听 SASS
    gulp.watch(`${config.src}/**/*.scss`, function(ev) {
      const file = ev.path;
      const distDir = config.src + '/css';
      watchTask.sass(file, distDir);
    });

    // 监听 SASS
    gulp.watch(`${config.src}/**/*.css`, function(ev) {
      const file = ev.path;
      watchTask.css(file);
    });

  });
};