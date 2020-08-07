const webpack = require('webpack');

module.exports = {
	entry: './src/index.js',
	output: {
		filename: 'main.bundle.js',
		path: __dirname + '/public/dist'
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
  ],
	resolve: {
		symlinks: false,
	},
	devtool: 'source-map'
}