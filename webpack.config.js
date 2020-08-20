const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/index.js',
	output: {
		filename: 'main.[contenthash].js',
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
		new CleanWebpackPlugin(),
		new CopyPlugin({
			patterns: [
				{
					from: 'public',
					cacheTransform: true,
					force: true,
				},
			],
		}),
		new HtmlWebpackPlugin({
			template: './public/index.html',
		}),
  ],
	resolve: {
		symlinks: false,
	},
	devtool: 'source-map'
}