/*
	ninth.js 
*/

(function(factory){
	"use strict";
	if (typeof define === 'function' && define.amd) {
		define(['jquery', 'Backbone'], factory);
	}
	else if(typeof exports === 'object') {
        
        var jquery = require('jquery'), Backbone = require('Backbone');
		factory(jquery,Backbone);
	}
	else {
		factory(window.jQuery, window.Backbone);
	}

}(function($, Backbone){
	"use strict";

    var Ninth = function(){
        this.VERSION = 0.1;
    };
    var _realBackbone = Ninth.prototype = Backbone.noConflict();
    var ninth = window.Backbone = new Ninth();
    var __oI18n;


     Ninth.prototype.getI18n = function(key){         
         
     	var aKey = key.split('.'), _key = __oI18n;
     	for(var i = 0, j = aKey.length; i < j; i++){
     		if(_key[aKey[i]]){
     			_key = _key[aKey[i]];
     		}else{
     			console.error("text key " + key + " is invalidate ");
     			return null;
     		}
     	}

     	if(Object.prototype.toString.call(_key) !== "[object String]"){
     		console.error("text key " + key + " is not a string");
 			return null;
     	}

     	var aParam = [].slice.call(arguments, 1);

     	return _key.replace(/\\?\#{([^{}]+)\}/gm,function(match, name){
     			if(match.charAt[0] ==='\\') return match.slice(1);
     			var index = name - 0;
     			if(index >= 0) return aParam[index];
     			return '';

     	});

     };

     Ninth.prototype.__initI18n = function(oJson){
     	__oI18n = oJson;
     };
    
    
    return ninth;
}));