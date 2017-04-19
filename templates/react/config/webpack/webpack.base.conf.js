const webpack = require('webpack');
const config = require('./settings/config');
const path = require('path');

module.exports = {
    entry: {
        app: './app/js/index.js'
    },
    output: {
        filename: 'js/[name].js'
    },
    resolve: {
        extensions: ['.js']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: path.resolve('./app/js')
            }
        ]
    }
};