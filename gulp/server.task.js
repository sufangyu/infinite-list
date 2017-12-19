/**
 * 本地服务器
 * @param  {Object} gulp    gulp
 * @param  {Object} config  配置
 * @param  {Object} $       插件集合
 * @param  {Object} proxy   代理服务器
 * @param  {Object} argv    获取命令行参数
 */

module.exports = function(gulp, config, $, proxy, argv) {
  const port = config.port;          // 端口号
  const https = argv.https || false; // 是否使用 https 协议. 默认 false.                 =>> 参数: --https
  const env = argv.env || 'dev';     // 当前的开发环境, 取值['dev', 'dist']. 默认 'dev'  =>> 参数: --env=dev
  const dir = env == 'dev' ? config.src : config.dist;  // 服务器的根目录
  const name = env == 'dev' ? '"src" =>> Develop server' : '"dist" =>> Preview server';
  const protocol = https ? 'https' : 'http'; // 协议
  

  gulp.task('open', function(){
    const options = {
      uri: protocol + '://localhost:' + port,
      app: 'chrome',
    };
    gulp.src(__filename)
    .pipe($.open(options));
  });


  gulp.task('server', function() {
    // 使用 connect 插件搭建本地服务器. 支持服务器代理, 解决跨域请求(例如: 跨域 API 调试)
    $.connect.server({
      name: name,
      root: dir,
      port: port,
      livereload: true,
      https: https,
      middleware: function() {
        return [
          proxy('/mso', {
            target: 'https://m.so.com',
            changeOrigin:true,
            pathRewrite: {
              '^/mso': '',
            },
          }),
        ]
      }
    });
  });
}