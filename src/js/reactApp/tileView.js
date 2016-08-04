"use strict";
// var $ = require("./../lib/jquery-1.11.2.js");
// var underscore = require("./../lib/underscore.js");
var Backbone = require("backbone");
import * as React from "react";
//var React = require("react");
var ReactDOM = require("react-dom");
var DropDown = require("./../widget/dropDown.jsx");
module.exports = function(){
		var rootEle = document.getElementById("example");
		console.log(typeof DropDown);
		ReactDOM.render( <DropDown /> ,rootEle);

};
