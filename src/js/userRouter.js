define(['jquery','backbone', 'underscore'],function($,Backbone,_){
    "use strict";
    
    
    var UserRouter = Backbone.Router.extend({
    
        routes:{
           "users/enterprise-user": "handleEnterPriseUser",
           "users/seller":"handleSeller"
        },
        
        initialize:function(){
            
        },
        
        handleEnterPriseUser:function(){
        
            
        },
        
        handleSeller:function(){
        
        }
    });
    
    return UserRouter;
});