/*
	input list 
*/

(function(factory){
	"use strict";
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	}
	else if(typeof exports === 'object') {
		factory(require('jquery'));
	}
	else {
		factory(jQuery);
	}

}(function($){
	"use strict";

	var _nid = 0;

	var InputList = function(rootEl, options, data){

		if(Object.prototype.toString.call(data) !== "[object Array]"){
			console.error("parameter data must be array");
			return;
		}
		var that = this;
		this.option = $.extend({

		},options);

		this.$root = $(rootEl).addClass("input-list-section");

		var _$label = $("<span>").addClass("").text(options.label);
		var _$areaHeader = $("<div>").addClass("section-header").append(_$label);
		
		this.$root.append(_$areaHeader);

		$.each(data,function(index,item){
			that.$root.append(new _InputPiece(that.option.attributes,item).$root);
		});

		this.$root.append(new _InputPiece().$root);

		/* bind event*/

		this.$root.on('click',".glyphicon-plus", $.proxy(this.add, this));
		this.$root.on('click',".glyphicon-trash", $.proxy(this.delete, this));
		this.$root.on('click',".glyphicon-pencil", $.proxy(this.change, this));
		this.$root.on('click',".glyphicon-floppy-save", $.proxy(this.save, this));
	};

	InputList.prototype.add = function(e, $ele){

		e = e || window.event;
		$(e.target).removeClass('glyphicon-plus');
		this.addItem();
		

	};

	InputList.prototype.addItem = function(){
		var _$newItem = new _InputPiece();
		this.$root.append(_$newItem.$root);
		_$newItem.hide();
		setTimeout(function(){
			_$newItem.$root.slideDown('slow');

		},0);

	};

	InputList.prototype.change = function(e){

		$(e.target).prev().attr("disabled", false);
		$(e.target).removeClass("glyphicon-pencil").addClass("glyphicon-floppy-save");

	};

	InputList.prototype.delete = function(e){

	   var _$input = $(e.target).prev().prev();

	   if(_$input.prev().hasClass("glyphicon-plus"))return;

	   if(_$input.attr("disabled") === "disabled"){

	   		//TODO
	   	 

	   }

	   $(e.target).parent().remove();

	}; 

	InputList.prototype.save = function(e){
		 var that = this;
		 var _$input = $(e.target).prev();

		 var _value = _$input.val();

		 if($.trim(_value) === 0){

		 }else{

		 	$.when().done(function(){

		 		_$input.attr("disabled","disabled");
		 		$(e.target).removeClass("glyphicon-floppy-save").addClass("glyphicon-pencil");
		 		if(_$input.prev().hasClass("glyphicon-plus")){
		 			_$input.prev().removeClass("glyphicon-plus");
		 			that.addItem();
		 		}
		 	});
	 }
	};


	var _InputPiece = function(options, data){

		var _isNew = data === undefined;
		var _options = $.extend({
			'class':'form-control',
			'disabled': false
			
		},options);

		this.$root = $("<div>").addClass("input-group").attr("data-nid", ++_nid);
		var _$input = $("<input>").attr(_options);
		var _$action1 = $("<span>");
		if(_isNew){
			_$input.val(data);

			var _$add = $("<span>").addClass("glyphicon glyphicon-plus action-before");

			_$action1.addClass("glyphicon glyphicon-floppy-save action-after");

		}else{
			var _$add = $("<span>").addClass("action-before");
			_$input.attr('disabled', true);
			_$input.val(data);
			_$action1.addClass("glyphicon glyphicon-pencil action-after");
		}
		
		var _$action2 = $("<span>").addClass("glyphicon glyphicon-trash action-after");
		this.$root.append(_$add).append(_$input).append(_$action1).append(_$action2);

	};

	_InputPiece.prototype.hide = function(){
		return this.$root.css('display','none');

	};

	_InputPiece.prototype.add = function(e){
		e = e || window.event;
		$(e.target).removeClass('glyphicon-plus');
		e.stopPropagation();
		e.preventDefault();

		$(e.target).trigger("inputList-addone", [e.target]);
	};

   var Plugin = function(options, data){

	   	return this.each(function(){
	   		new InputList(this, options, data);
	   		
	   	});
   };
  $.fn.inputList             = Plugin;
  $.fn.inputList.Constructor = InputList;

}));