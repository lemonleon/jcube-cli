const path = require('path');

module.exports = {
    prod: {
        env: {NODE_ENV: '"production"'},
        publicPath: '//static.360buyimg.com/finance/{{releasePath}}',
        outputPath: path.resolve('./', 'build')
    },
    dev: {
        env: {NODE_ENV: '"development"'},
        outputPath: '/',
        port: '8081'
    },
    ftp: {
        host: '',   //主机地址
        user: '',   //用户名
        pass: '',   //密码
        port: 21    //端口号
    }
};