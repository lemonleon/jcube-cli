const path = require('path');
const webpack = require('webpack');
const argv = require('yargs').argv;
const AssetsWebpackPlugin = require('assets-webpack-plugin');

const env = argv.env;

var dllPath = env == 'dev' ? 'app/dll' : 'static/dll';

function dllConf(type){
    var dllPath = env == 'dev' ? 'app/dll' : 'static/dll';
    var dllPlugins = env == 'dev' ?
    [   //dev
        new webpack.DllPlugin({
            path: path.join('./', dllPath, 'vendor-manifest.json'),
            name: '[name]_library'
        }),
        new AssetsWebpackPlugin({
            path: path.join('./', dllPath),
            filename: 'vendor.dll.config.json'
        })
    ] : 
    [   //prod
        new webpack.DllPlugin({
            path: path.join('./', dllPath, 'vendor-manifest.json'),
            name: '[name]_library'
        }),
        new AssetsWebpackPlugin({
            path: path.join('./', dllPath),
            filename: 'vendor.dll.config.json'
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ];

    return {
        dllPath: dllPath,
        dllPlugins: dllPlugins
    };
}

module.exports = {
    entry: {
        vendor: ['react', 'react-dom']
    },
    output: {
        path: path.resolve('./', dllConf(env).dllPath),
        filename: 'vendor.dll.js',
        library: '[name]_library'
    },
    plugins: dllConf(env).dllPlugins
};