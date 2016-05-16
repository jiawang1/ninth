"use strict";
var path = require("path");
module.exports = {

	entry: "./src/js/reactApp/entry.js",
	output: {
		path: path.join(__dirname ,"/src/assets/"),
		filename: "bundle.js"
	},

	resolve:{
		 // root: path.join(__dirname, "./../") ,

		 alias: {
		      // 'React': 'react/addons',
		      
		      'jquery':path.join(__dirname , 'src/js/lib/jquery-1.11.2.js')
		    }
	},
	module: {
		loaders: [
			{
				test: /\.css$/,
				exclude: /node_modules/,
				loader: "style-loader!css-loader"
			}
			,{
				test:/\.jsx?$/,
				exclude: /node_modules/,
				loader:"babel-loader",
				query:{
					 presets: ['es2015', 'react']
				}
			 
			 }

		]
	}
};
