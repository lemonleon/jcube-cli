const path = require('path');

module.exports = {
    prod: {
        env: {NODE_ENV: '"production"'},
        publicPath: '/static',
        outputPath: path.resolve('./', 'build')
    },
    dev: {
        env: {NODE_ENV: '"development"'},
        outputPath: '/',
        port: '8081'
    }
};