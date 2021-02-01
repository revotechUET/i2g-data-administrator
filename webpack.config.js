const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/index.js',
	output: {
		filename: 'main.[hash:8].js',
		path: __dirname + '/dist'
	},
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.html$/,
				use: ['html-loader']
			},
			{
				test: /\.less$/,
				use: ["style-loader", "css-loader", "less-loader"]
			},
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
			}
		]
	},
	plugins: [
		new webpack.EnvironmentPlugin({
			NODE_ENV: 'development',
		}),
		new CleanWebpackPlugin({
			cleanOnceBeforeBuildPatterns: ['**/*', '!bower_components/**'],
		}),

		new HtmlWebpackPlugin({
			title: 'Corporate Database',
			favicon: './public/i2g_fav.png',
		}),
	],
	resolve: {
		symlinks: false,
	},
	devtool: 'source-map'
}