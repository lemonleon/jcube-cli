const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');

const config = require('./settings/config');
const baseWebpackConfig = require('./webpack.base.conf');
const env = config.prod.env;
const vendorDLLConfig = require('../../\.jcube/dll/vendor.dll.config.json');

module.exports = merge(baseWebpackConfig, {
    devtool: false,
    output: {
        publicPath: config.prod.publicPath,
        path: config.prod.outputPath,
        chunkFilename: 'js/chunk-[name].js'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                        fallback: "style-loader",
                        use: [
                            'css-loader?importLoaders=1',
                            {
                                loader: 'postcss-loader',
                                options: {
                                    plugins: function () {
                                        return [
                                            require('autoprefixer')({
                                                browsers: ['last 3 versions']
                                            })
                                        ];
                                    }
                                }
                            }
                        ]
                    })
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                        fallback: "style-loader",
                        use: [
                            'css-loader',
                            {
                                loader: 'postcss-loader',
                                options: {
                                    plugins: function () {
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
                    })
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
            'process.env': env
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
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
        new HtmlWebpackPlugin({
            filename: 'html/index.html',
            template: 'app/html/index.html',
            vendorDLL: config.prod.publicPath+'dll/'+vendorDLLConfig.vendor.js
        }),
        new webpack.DllReferencePlugin({
            context: './',
            manifest: require('../../\.jcube/dll/vendor-manifest.json')
        }),
        new ExtractTextPlugin({
            filename: 'css/[name].boundle.css',
            allChunks: true
        }),
        new OptimizeCSSPlugin({
            cssProcessorOptions: {
                safe: true
            }
        }),
        new CopyWebpackPlugin([
            {
                from: path.resolve('./', '\.jcube/dll'),
                to: config.prod.outputPath+'/dll',
                ignore: ['*.json']
            }/*,
            {
                from: path.resolve('./', 'app/data'),
                to: config.prod.outputPath+'/data'
            }*/
        ])
    ]
});