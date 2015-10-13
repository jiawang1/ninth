define(['babel'],function(babel){
	'use strict';

	var _extensionX = ".jsx",
		_extensionJS = ".js",
		_buildMap = {};


	var loadFile = function(path, cb){
		if(typeof window !== "undefined" && window.navigator && window.document){
			var xhr = new XMLHttpRequest();

			xhr.open('GET', path, true);
			 xhr.onreadystatechange = function(evt){
			 	(xhr.readyState === 4) && cb.call(null, xhr.responseText);
			 };
			 xhr.send(null);
		} else if(typeof process !== "undefined" && process.versions && !!process.versions.node){
			var fs = require.nodeRequire('fs');
			var _file = fs.readFileSync(path,'utf8');
			cb.call(null, _file);
		}
	};

	return {
		load:function(name, req, onload, config){

			var url = req.toUrl(name);
			loadFile(url, function(text){

				var code = babel.transform(text).code;

				if(config.isBuild){
					_buildMap[name] = code;
				}
				onload.fromText(code); 
			});

		},
		normalize:function(name, normalize){

			if(name.lastIndexOf(".") > 0){
				return name.slice(0, name.lastIndexOf(".")) + _extensionX;
			}

			return name + _extensionX;
		},
		write:function(pluginName, moduleName, write){
			if(_buildMap.hasOwnProperty(moduleName)){
			// use method asModule to get rid of MISMATCHED ANONYMOUS DEFINE() MODULES error....
				write.asModule(pluginName + '!' + moduleName, _buildMap[moduleName]);
				delete _buildMap[moduleName];
			}
		}
	};
});