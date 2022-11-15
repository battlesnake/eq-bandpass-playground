const path = require('path');

module.exports = {
	entry: './src/main.ts',
	devtool: 'inline-source-map',
	module: {
		rules: [
			{
				test: /\.(js|ts)$/,
				loader: 'source-map-loader',
				enforce: 'pre'
			},
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'public/js/'),
	},
	resolve: {
		fallback: {
			fs: false,
			path: false,
		},
		extensions: [
			'.ts',
			'.js',
		],
	},
};
