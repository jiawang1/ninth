define(['jquery','backbone', 'underscore','text!../template/inputListTpl.html',
    'css!../css/widget/inputList'
    ],function($,Backbone,_,sInputTemplate){
    "use strict";
    
    var ChangeStoreView = Backbone.View.extend({
        $el:$("<div>"),
        initialize:function(){                      /* constructor for this class*/

        },
        
        render:function(){
            this.$el.html(_.template(sInputTemplate));

              $(".input-list", this.$el).inputList({
                "label": 'Input List'
              }, ['a', 'b']);
            return this;
        },
        destroy:function(){
        
        }
    
    });
    
    return ChangeStoreView;
});