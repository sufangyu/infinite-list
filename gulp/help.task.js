/**
 * help task
 * @param {Object} gulp
 */
module.exports = function(gulp) {
    
  gulp.task('help', function () {
    console.log('------------------------------------------');
    console.log('gulp dev            项目开发');
    console.log('  --env=dev         开发版服务器 (dev/dist)');
    console.log('  --https           使用 https 协议');
    console.log('------------------------------------------');
    console.log('gulp build          项目打包');
    console.log('  --rev             生成版本号');
    console.log('  --unref           不使用 useref 打包');
    console.log('  --zip             压缩打包生产的文件');
    console.log('------------------------------------------');
    console.log('gulp server         服务器');
    console.log('  --env=dev         开发版服务器 (dev/dist)');
    console.log('  --https           使用 https 协议');
    console.log('------------------------------------------');
    console.log('gulp clean          删除内容:');
    console.log('------------------------------------------');
  });

};