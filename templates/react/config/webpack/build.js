require('./check-versions')();

process.env.NODE_ENV = 'production';

const path = require('path');
const ora = require('ora');
const webpack = require('webpack');
const chalk = require('chalk');
const rm = require('rimraf')

const config = require('./settings/config');
const webpackConfig = require('./webpack.prod.conf');

var assetsPath = config.prod.outputPath;
var spinner = ora('building for production...');
spinner.start();

rm(assetsPath, err => {
    if(err) throw err;

    webpack(webpackConfig, function (err, stats) {
        spinner.stop()

        if (err) throw err

        process.stdout.write(stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
        }) + '\n\n');

        console.log(chalk.cyan('  Build complete.\n'))
        console.log(chalk.yellow(
            '  Tip: built files are meant to be served over an HTTP server.\n' +
            '  Opening index.html over file:// won\'t work.\n'
        ))
    });
});
