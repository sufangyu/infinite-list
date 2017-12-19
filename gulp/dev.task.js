/**
 * 项目开发
 * @param {Object} gulp   gulp
 * @param {Object} config 配置
 * @param {Object} $      插件集合
 * @param {Object} runSequence 任务执行顺序
 */
module.exports = function (gulp, config, $, runSequence) {
  gulp.task('dev', function() {
      runSequence('server', 'watch', 'open');
  });
};