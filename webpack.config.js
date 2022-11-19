const path = require('path');

module.exports = {
	mode: 'development',
	entry: {
		main: './src/main.ts',
	},
	optimization: {
		runtimeChunk: 'single',
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all'
				}
			}
		}
	},
	devtool: 'source-map',
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
		filename: '[name].js',
		path: path.resolve(__dirname, 'public/'),
	},
	devServer: {
		static: path.join(__dirname, 'public/'),
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
