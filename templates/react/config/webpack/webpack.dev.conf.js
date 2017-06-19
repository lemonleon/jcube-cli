const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const config = require('./settings/config');
const baseWebpackConfig = require('./webpack.base.conf');
const vendorDLLConfig = require('../../app/dll/vendor.dll.config.json');

Object.keys(baseWebpackConfig.entry).forEach(function (name){
    baseWebpackConfig.entry[name] = ['./config/webpack/dev-client'].concat(baseWebpackConfig.entry[name]);
});

module.exports = merge(baseWebpackConfig, {
    output: {
        path: config.dev.outputPath,
        chunkFilename: 'js/chunk-[name].js'
    },
    devtool: '#cheap-module-source-map',
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    { loader: "style-loader" },
                    { loader: "css-loader" },
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: function (){
                                return [
                                    require('autoprefixer')({
                                        browsers: ['last 3 versions']
                                    })
                                ];
                            }
                        }
                    }
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    {loader: 'style-loader'},
                    {loader: 'css-loader'},
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: function (){
                                return [
                                    require('autoprefixer')({
                                        browsers: ['last 3 versions']
                                    })
                                ];
                            }
                        }
                    },
                    {loader: 'sass-loader'}
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                query: {
                    limit: 1,
                    name: '/css/i/[name].[ext]'
                }
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': config.dev.env
        }),
        //模块热替换
        new webpack.HotModuleReplacementPlugin(),
        //用来跳过编译时出错的代码并记录，使编译后运行时的包不会发生错误
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: function (module, count) {
                // any required modules inside node_modules are extracted to vendor
                return (
                    module.resource &&
                    /\.js$/.test(module.resource) &&
                    module.resource.indexOf(
                        path.join(__dirname, '../../node_modules')
                    ) === 0
                )
            }
        }),
        //dll引用
        new webpack.DllReferencePlugin({
            context: './',
            manifest: require('../../app/dll/vendor-manifest.json')
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'app/html/index.html',
            vendorDLL: '/static/dll/'+vendorDLLConfig.vendor.js,
            inject: true
        }),
        new FriendlyErrorsPlugin()
    ]
});