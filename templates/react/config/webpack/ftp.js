/**
 * Des
 * Created by luowei5 on 2017/8/21.
 * E-mail luowei5@jd.com
 * Update 2017/8/21
 */

const chalk = require('chalk');
const path = require('path');
const vinylFs = require( 'vinyl-fs' );
const ftp = require( 'vinyl-ftp' );
const gutil = require( 'gulp-util' );
const fs = require('fs');

const config = require('./settings/config.js');

var projectPath = config.prod.publicPath.replace(/\/\/static\.360buyimg\.com\/finance\//, '');
var remoteStaticPath = '/var/www/static.360buyimg.com/finance/'+projectPath,
    remoteDemoPath = '/var/www/demo.jr.jd.com/'+projectPath;

var argv;
try {
    argv = JSON.parse(process.env.npm_config_argv).original;
}	catch(ex) {

}

var conn = new ftp({
    host: config.ftp.host,
    user: config.ftp.user,
    password: config.ftp.pass,
    port: config.ftp.port || 21,    //默认端口
    parallel: 10,   //并行数
    log: gutil.log
});

if(!argv.length) throw new Error('上传错误！');

var target = argv[2]; //目标地址：demo、static

//static
function ftp2static() {
    var staticSrc = ['build/**/*.*',];

    fs.existsSync(path.resolve('./', 'build/html')) && staticSrc.push('!build/html/**');
    fs.existsSync(path.resolve('./', 'build/mock')) && staticSrc.push('!build/mock/**');


    vinylFs.src( staticSrc, { buffer: false } )
        .pipe( conn.dest( remoteStaticPath ) )
        .on("error", function (err){
            gutil.log("***上传错误："+err);
        })
        .on("end", function (){
            gutil.log("***发布完成!");
        });
}
//demo
function ftp2demo() {
    var demoSrc = ['build/**/*.*',];

    fs.existsSync(path.resolve('./', 'build/dll')) && demoSrc.push('!build/dll/**');
    fs.existsSync(path.resolve('./', 'build/js')) && demoSrc.push('!build/js/**');
    fs.existsSync(path.resolve('./', 'build/css')) && demoSrc.push('!build/css/**');
    fs.existsSync(path.resolve('./', 'build/resources')) && demoSrc.push('!build/resources/**');

    vinylFs.src( demoSrc, { buffer: false } )
        .pipe( conn.dest( remoteDemoPath ) )
        .on("error", function (err){
            gutil.log("***上传错误："+err);
        })
        .on("end", function (){
            gutil.log("***发布完成!");
        });
}

switch (target){
    case '--demo':
        ftp2demo();
        break;
    case '--static':
        ftp2static();
        break;
    default:
        ftp2demo();
        ftp2static();
        break;
}
