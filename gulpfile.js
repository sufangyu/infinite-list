"use strict";

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();        // 加载以来
const runSequence = require('run-sequence');     // 控制任务顺序
const proxy = require('http-proxy-middleware');  // 服务器代理
const pngquant = require('imagemin-pngquant');   // 深度压缩图片
const argv = require('yargs').argv;              // 获命令行中的参数
const del = require('del');                      // 删除文件与文件夹
const config = require('./gulp/gulp.config.js'); // gulp 配置

require('./gulp/help.task.js')(gulp); // 帮助
require('./gulp/server.task.js')(gulp, config, $, proxy, argv); // 本地服务器
require('./gulp/watch.task.js')(gulp, config, $, runSequence);  // 监听
require('./gulp/clean.task.js')(gulp, config, $, argv, del);    // 删除
require('./gulp/dev.task.js')(gulp, config, $, runSequence);    // 开发
require('./gulp/build.task.js')(gulp, config, $, runSequence, pngquant, argv);  // 打包发布

gulp.task('default', function() {
  gulp.start('help');
});