'use strict';
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


module.exports = {
	// Abort the compilation on first error
	bail: true,

	// Generate source maps
	devtool: 'source-map',

	resolve: {
		plugins: [],

		modules: ['node_modules'],

		descriptionFiles: ['package.json'],

		mainFields: ['main', 'browser'],

		mainFiles: ['index', 'main'],

		aliasFields: ['browser'],
	},

	module: {
		rules: [
			// babel
			{
				test: /\.js$/,
				loader: 'babel-loader',
				options: {
					babelrc: false,
					cacheDirectory: true,
					plugins: [
						require.resolve('@babel/plugin-transform-classes'),
						require.resolve('babel-plugin-add-module-exports'),
						[require.resolve('@babel/plugin-transform-runtime'), { helpers: false, regenerator: false }],
						[require.resolve('babel-plugin-transform-es2015-classes'), { loose: true }],
					],
					presets: [['@babel/preset-env', { modules: false }]],
				},
			},
			// scss
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							minimize: true,
							sourceMap: true,
						},
					},
					{
						loader: 'postcss-loader',
						options: {
							plugins: () => [
								require('autoprefixer')({
									browsers: ['> 1%', 'last 2 versions', 'ie >= 9', 'ff ESR', 'bb >= 7', 'iOS >= 5'],
									flexbox: 'no-2009',
								}),
							],
						},
					},
					{
						loader: 'sass-loader',
						options: {
							sourcemap: true,
							iclencludePaths: [
								path.resolve('./node_modules'),
								path.resolve('./node_modules/@financial-times'),
							],
							outputStyle: 'expanded',
						},
					},
				],
			},
		],
	},

	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css',
		}),
	],

	output: {
		filename: '[name].js',
		devtoolModuleFilenameTemplate: 'n-ui//[resource-path]?[loaders]',
	},

	entry: {
		main: './src/js/index.js',
	},
};
