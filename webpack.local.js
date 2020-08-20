const webpack = require('webpack');
var HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

module.exports = {
	entry: './src/index.js',
	output: {
		filename: 'main.[contenthash].js',
		path: __dirname + '/dist'
	},
	mode: 'development',
	module: {
		rules: [{
			test: /\.html$/,
			use: ['html-loader']
		}, {
			test: /\.less$/,
			use: ["style-loader", "css-loader", "less-loader"]
		}]
	},
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),
    new HardSourceWebpackPlugin(),
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
  ]
}
