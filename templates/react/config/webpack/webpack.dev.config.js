const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const config = require('./settings/config');
const baseWebpackConfig = require('./webpack.base.config');
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
                    name: '/css/[name].[ext]'
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
        //提取CSS模块
        // new ExtractTextPlugin({
        //     filename: 'css/[name].boundle.css',
        //     disable: false,
        //     allChunks: true
        // }),
        //dll引用
        // new webpack.DllReferencePlugin({
        //     context: './',
        //     manifest: require('../../app/dll/vendor-manifest.json')
        // }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'app/html/index.html',
            //vendorDLL: '/static/dll/'+vendorDLLConfig.vendor.js,
            inject: true
        }),
        new FriendlyErrorsPlugin()
    ]
});