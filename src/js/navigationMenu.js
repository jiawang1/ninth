define(['jquery','backbone', 'underscore',"text!./../template/navigationTpl.html"],function($,Backbone,_,sTemplate){
    "use strict";
    
    var NavigationMenu = Backbone.View.extend({
        $el:$("<ul>"),
        initialize: function(aConfig){
            this.__aConfig = aConfig;
            
            $.each(this.__aConfig,function(index, item){
                item.children&&$.each(item.children, function(index,child){
                    if(child.link.indexOf("#") !== 0){
                        child.link = item.link + child.link; 
                    }
                });
            
            });
            this.$el.on("click", ">ul",$.proxy(this.menuClickHandler, this));

        },
        
        render:function(){

            this.$el.html(_.template(sTemplate,{"data":this.__aConfig}));

            return this;
        },
        
        menuClickHandler:function(e){
            
            e = e || window.event;
            var $element = $(e.target);
            var targetURL;
            
           function findTarget($element){
            
               if($element.attr("data-link")){
                    return $element;
               }else{

                var _$p = $element.parent();
                if(_$p.length > 0){
                    return findTarget(_$p);
                }
                   console.error("does not find navigation link");
               }
           }
            
            var $target = findTarget($(e.target));
            
            if($target.hasClass("active")) return false;    /* click itself*/
            
            if($target.hasClass("nav-super")){
                
                var $icon = $target.children(".glyphicon");
                var $subFrame = $target.next();
                if($icon.hasClass("glyphicon-plus")){
                    $icon.removeClass("glyphicon-plus").addClass("glyphicon-minus");
                    $subFrame.hasClass("nav-sub")&&$subFrame.slideDown("fast");
                }else{
                    $icon.removeClass("glyphicon-minus").addClass("glyphicon-plus");
                    $subFrame.hasClass("nav-sub")&&$subFrame.slideUp("fast");
                }
            } else {
                $(".active", this.$el).removeClass("active");
                $target.addClass("active");
                targetURL = $target.attr("data-link");
            }
            
            targetURL&&require(["applicationRouter"], function(oRouter){
                oRouter.navigate(targetURL,{trigger: true});
                
            });

        }
        
        
    });
    
    return NavigationMenu;
});