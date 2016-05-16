define(['jquery','backbone', 'underscore','text!../template/dragdropTpl.html',
    'css!../css/widget/dragdrop'
    ],function($,Backbone,_,sDragdrop){
    "use strict";
    
    var DrapdropView = Backbone.View.extend({
        $el:$("<div>"),
        initialize:function(){                      /* constructor for this class*/
			
        }
		,startMoving: false
		,$moveingTarget:null
		,_offsetY:0
		,$shadowBlock: null
		,permHeight: 40
		,placeBeforeTargetID:null
	    ,placeAfterTargetID: null
		,itemStack:[]
		,render:function(){
            this.$el.html(_.template(sDragdrop));
			$(".moveItem", this.$el).height(this.permHeight);
			$(".dragger-container", this.$el).on("mousedown",$.proxy(this.onMouseDown, this))
			.on("mousemove", $.proxy(this.onMouseMove, this))
			.on("mouseup",$.proxy(this.onMouseUp, this));
            //  $(".input-list", this.$el).inputList({
            //    "label": 'Input List'
            //  }, ['a', 'b']);
            return this;
        },
        destroy:function(){
        
        }
		,onMouseDown:function(e){
			if(this.starMoving){
				return false;
			}
			e = e || window.event;
			var $target= this.$moveingTarget = $(e.target || e.srcElement);

			if($target.hasClass("dragger-container")){
				return false;
			}	
			
			$target = this.findTargetByClass($target, "moveItem");
			
			if($target.length === 0){
				console.error("can not find moving target");
				return false;
			}
			this.startMoving = true;
			this.placeBeforeTargetID = null;
			this.placeAfterTargetID = null;
			this.parentStartPoint = $target.offsetParent().offset();

			var initPosition =  $target.position();
			this._offsetY = e.clientY -  $target.offset().top;   // clientY
			this.$shadowBlock = $(".shadowTarget", this.$el).addClass("shadow-active").css({"height":$target.outerHeight() + "px" }).detach();
			$target.before(this.$shadowBlock);
			$target.addClass("moving").css({"top": initPosition.top  });
			this.buildStack();	
			e.preventDefault();
			e.stopPropagation();

		}
		,onMouseMove:function(e){
			var that = this;
			if(!this.startMoving){
				return false;
			}

			e = e || window.event;
			
			var _top = e.clientY - this.parentStartPoint.top - this._offsetY;	
			this.$moveingTarget.css({
				top: _top	
			});

			var shadowPoint = this.$shadowBlock.offset();
			
		   var _targetIndex = -1;
		   this.itemStack.some(function(currentValue, index){
				if(currentValue.top >= _top){
					_targetIndex = index;
					return true;
				}
		   });	
		 
		   if(_targetIndex === 0){
				 that.placeAfterTargetID = null;
			     that.placeBeforeTargetID = this.itemStack[0].id;
					renderTargets([that.placeBeforeTargetID]);
						
			   }else if(_targetIndex > 0){
				  that.placeBeforeTargetID = this.itemStack[_targetIndex].id;
			      that.placeAfterTargetID =  this.itemStack[_targetIndex - 1].id;
				  	renderTargets([that.placeAfterTargetID, that.placeBeforeTargetID ]);

		   }else if (_targetIndex < 0){
			   that.placeBeforeTargetID = null;
				that.placeAfterTargetID = this.itemStack[ this.itemStack.length -1].id;
				renderTargets([that.placeAfterTargetID]);
				
		   }

		   function renderTargets(ids){
				
			   $(".dragger-container").children().each(function(inx, ele){
					var $ele = $(ele);		
				   if(ids.indexOf($ele.attr("id")) >= 0){
						$ele.addClass("insertTarget");
				   }else{
						$ele.removeClass("insertTarget");
				   }
			   
			   });
			
		   }
			

		}
		,onMouseUp:function(e){

			this.startMoving = false;
			
			this.$moveingTarget.detach();
			

			if(this.placeBeforeTargetID){
				this.$shadowBlock.removeClass("shadow-active");
				$("#" + this.placeBeforeTargetID).before(this.$moveingTarget);
			
			}else if (this.placeAfterTargetID){
					this.$shadowBlock.removeClass("shadow-active");
					$("#" + this.placeAfterTargetID).after(this.$moveingTarget);
			}
			this.$moveingTarget.removeClass("moving");
			$(".insertTarget").removeClass("insertTarget");
			this.$moveingTarget = null;
		
		}
		,buildStack:function(){
			var that = this;
			this.itemStack = [];

			[].reduce.call($(".dragger-container", this.$el).children(),function(pre, ele,index){
				if($(ele).hasClass("moving")){
					return true;					
				}
				var times = 0;
				if(pre){
					times = index -1;		
				}else{
					times = index;
				}
				that.itemStack.push({
					"top": that.permHeight * times,
					"id": $(ele).attr("id")
				});
					return pre;
				
				}, false
			);

		}
		,findTargetByClass:function($target, targetClass){
			if($target.hasClass(targetClass)){
				return $target;
			}
			
			return $target.parentsUntil(targetClass.indexOf(".") === 0?targetClass: "." + targetClass );
		}
    
    });
    
    return DrapdropView;
});
