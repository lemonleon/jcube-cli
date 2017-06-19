require('./check-versions')();

const config = require('./settings/config');
//if (!process.env.NODE_ENV) process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV);

const path = require('path');
const express = require('express');
const webpack = require('webpack');
const opn = require('opn');
const webpackConfig = require('./webpack.dev.conf');

var port = process.env.PORT || config.dev.port;

const app = express();
const compiler = webpack(webpackConfig);

const devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: '/',
    quiet: true
});
const hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => {}
});

// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation){
    compilation.plugin('html-webpack-plugin-after-emit', function (data, cb){
        hotMiddleware.publish({action: 'reload'});
        cb();
    });
});

app.use(require('connect-history-api-fallback')());

app.use(devMiddleware);

app.use(hotMiddleware);

app.use('/static', express.static('./app'));

var uri = 'http://localhost:' + port;

var _resolve;
var readyPromise = new Promise(resolve => {
  _resolve = resolve
});

console.log('> Starting dev server...');
devMiddleware.waitUntilValid(() => {
  console.log('> Listening at ' + uri + '\n');
  
  opn(uri);
  _resolve()
});

var server = app.listen(port);