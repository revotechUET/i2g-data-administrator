const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackDeployPlugin = require('html-webpack-deploy-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isProduction = (process.env.NODE_ENV || '').toLowerCase().includes('prod')

module.exports = {
	entry: './src/index.js',
	output: {
		filename: 'main.[contenthash:8].js',
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
		new HtmlWebpackDeployPlugin({
			append: false,
			useHash: isProduction,
			assets: {
				copy: [
					{ from: './public/assets', to: '/' }
				],
				links: [
					'themify-icons/themify-icons.css'
				]
			},
			packages: {
				'jquery': { copy: [{ from: 'dist/jquery.min.js', to: '/' }], scripts: 'jquery.min.js' },
				'jquery-ui-dist': { copy: [{ from: '/', to: '/' }], scripts: 'jquery-ui.min.js', links: 'jquery-ui.min.css' },
				'bootstrap': { copy: [{ from: 'dist', to: '/' }], scripts: 'js/bootstrap.min.js', links: 'css/bootstrap.min.css' },
				'lodash': { copy: [{ from: 'lodash.min.js', to: '/' }], scripts: 'lodash.min.js' },
				'angular': { copy: [{ from: '/', to: '/' }], scripts: 'angular.min.js' },
				'ui-select': { copy: [{ from: 'dist', to: '/' }], scripts: 'select.min.js', links: 'select.min.css' },
				'angular-sanitize': { copy: [{ from: '/', to: '/' }], scripts: 'angular-sanitize.min.js' },
				'angular-resizable': { copy: [{ from: '/', to: '/' }], scripts: 'angular-resizable.min.js', links: 'angular-resizable.min.css' },
				'toastr': { copy: [{ from: 'build', to: '/' }], scripts: 'toastr.min.js', links: 'toastr.min.css' },
				'ng-file-upload': { copy: [{ from: 'dist', to: '/' }], scripts: 'ng-file-upload.min.js' },
				'ng-dialog': { copy: [{ from: 'js', to: '/' }, { from: 'css', to: '/' }], scripts: 'ngDialog.min.js', links: ['ngDialog.min.css', 'ngDialog-theme-default.min.css'] },
				'angular-modal-service': { copy: [{ from: 'dst', to: '/' }], scripts: 'angular-modal-service.min.js' },
				'resize-sensor': { copy: [{ from: 'ResizeSensor.min.js', to: '/' }], scripts: 'ResizeSensor.min.js' },
				'virtual-list': { copy: [{ from: 'vlist.js', to: '/' }], scripts: 'vlist.js' },
				'moment': { copy: [{ from: 'min/moment.min.js', to: '/' }], scripts: 'moment.min.js' },
				'async': { copy: [{ from: 'dist/async.min.js', to: '/' }], scripts: 'async.min.js' },
				'font-awesome': { copy: [{ from: 'css', to: 'css' }, { from: 'fonts', to: 'fonts' }], links: 'css/font-awesome.min.css' },
				'@revotechuet/misc-component': { copy: { from: 'dist', to: '/' }, scripts: 'misc-components.js' },
				'@revotechuet/file-explorer': { copy: { from: 'dist', to: '/' }, scripts: 'file-explorer-module.js' },
			}
		}),
		new HtmlWebpackPlugin({
			title: 'Corporate Database',
			favicon: './public/i2g_fav.png',
			scriptLoading: 'blocking'
		}),
	],
	resolve: {
		symlinks: false,
	},
	devtool: 'source-map'
}