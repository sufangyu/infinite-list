/**
 * clean task
 * @param  {Object} gulp    gulp
 * @param  {Object} config  gulp 配置
 * @param  {Object} $       gulp  插件集合
 * @param  {Object} argv    获命令行中参数
 * @param  {Object} del     删除文件
 */
module.exports = function (gulp, config, $, argv, del) {
  gulp.task('clean', function() {
    const source = `${config.dist}`;
    return del(source);
  });
};