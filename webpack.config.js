"use strict";
var path = require("path");
module.exports = {

	entry: "./src/js/reactApp/entry.js",
	output: {
		path: path.join(__dirname ,"/src/assets/"),
		filename: "bundle.js",
		sourceMapFilename:"[file].map"
	},

	resolve:{
		  //root: path.join(__dirname) ,

		 alias: {
		       'React':  path.join(__dirname,'./src/node_modules/react'),
			   'reactDOM': path.join(__dirname,'./src/node_modules/react-dom'),
			  
		      
		      'jquery':path.join(__dirname , 'src/js/lib/jquery-1.11.2.js')
		    }
	},
/*
 *	seems for plain css, it is not a webpack module, so the 
 *	loader must outof module{},
 *	
 * */
	loaders:[
			{
				test: /\.css$/,
				exclude: /node_modules/,
				loader: "style-loader!css-loader"
			},
			   { test: /\.png$/, loader: "url-loader?limit=100000" },
      { test: /\.jpg$/, loader: "file-loader" }

	
	
	],

	module: {
		loaders: [
				{
				test:/\.jsx?$/,
				exclude: /node_modules/,
				loader:"babel-loader",
				query:{
					 presets: ['es2015', 'react']
				}
			 
			 },
			    { test: /\.png$/, loader: "url-loader?limit=100000" },
      { test: /\.jpg$/, loader: "file-loader" }
		
		]
	}
};
