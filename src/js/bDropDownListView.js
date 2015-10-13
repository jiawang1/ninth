define(['jquery','backbone', 'underscore','text!../template/bDropDownListTpl.html','dropDown'],function($,Backbone,_,sDropDownTemplate){
    "use strict";
    
    var BDropDownListView = Backbone.View.extend({
        $el:$("<div>"),
        initialize:function(){                      /* constructor for this class*/

        },
        
        render:function(){
            this.$el.html(_.template(sDropDownTemplate));
            return this;
        },
        destroy:function(){
        
        }
    
    });
    
    return BDropDownListView;
});