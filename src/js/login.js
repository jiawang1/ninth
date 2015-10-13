(function(){
	"use strict";

	$(function(){

		$(".btn-default").on('click',function(e){

			var __hasError = false;
			var data = {};
			$(".form-control").each(function(){
				var __val = $(arguments[1]).val();
				if(__val&&$.trim(__val).length > 0){
					data[$(arguments[1]).attr('name')] = __val;
				}else{
					__hasError = true;
					if($(arguments[1]).attr('name') === 'name'){
						$(arguments[1]).parent().siblings('p').text("请输入用户名");
					}else{
						$(arguments[1]).parent().siblings('p').text("请输入密码");
					}
					$(arguments[1]).parents(".input-group").addClass("error-message");
				}

			});

			if(__hasError)return;

			$.post("", data, function(data){


			}, "json");



		});

		$(".form-control").on("focus",function(e){

			$(this).parents(".error-message").removeClass("error-message");
		});


		$(".user-form").on("keyup",function(e){

			var $target = $(e.target);
			if($target.hasClass("form-control")){

				var $parent = $target.parent();
				if($target.val().length > 0){
					$parent.next().hasClass("login-hide")&&$parent.next().removeClass("login-hide");
				}else{
					$parent.addClass("login-hide");
				}
			}

		}).on('click',function(e){

			var $target = $(e.target);
			if($target.hasClass("input-clear") && !$target.hasClass("login-hide")){
				$target.prev().children('input').val('');
				$target.addClass("login-hide");
			}

			$target.parents(".error-message").removeClass("error-message");

		});


	});

})();