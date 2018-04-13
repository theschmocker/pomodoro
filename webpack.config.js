const { resolve, join } = require('path');

const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');

const OUTPUT_PATH = './dist';

module.exports = {
    module: {
        rules: [
            {
                test: /\.html$/,
                loader: 'html-loader',
                options: { minimize: true },
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                }
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [
                    'style-loader',
                    'css-loader',
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: './src/index.html',
            filename: './index.html'
        }),
        new CopyWebpackPlugin([
            { from: 'src/static', to: 'static'},
            { from: 'src/favicon.ico', to: 'favicon.ico'},
        ]),
        new ServiceWorkerWebpackPlugin({
            entry: './src/sw.js',
            excludes: ['**/.*', '**/*.map', '*.html'], 
        }),
    ]
}
