define(['jquery','backbone', 'underscore','navigationMenu','jsx!sampleView',
    
    'widget/inputList','widget/nGrid' ],
       function($,Backbone,_, Navigation,Sample){
    "use strict";


    var i = 0;
var AppRouter = Backbone.Router.extend({
    
        routes:{

            "sample":"handleSample",
            "default":"createFrame" ,
            "grid/jqGrid": "showJQGrid",
            "grid/nGrid": "showNGrid",
            "form/b-dropdown":"showBDropDown" ,
            "form/inputlist":"showInputList" 
        },
        
    /*  destrpy method should be supplied to prevent memory leak*/
    
        showBDropDown:function(){
            require(["bDropDownListView"], function(ListView){
                $(".main-root").empty().append(new ListView().render().$el);
            });
        },
        
        showInputList:function(){
            require(["inputListView"], function(InputList){
                $(".main-root").empty().append(new InputList().render().$el);
            });
        },
    
        showNGrid:function(){
            require(["nGridView"], function(NGridView){
                $(".main-root").empty().append(new NGridView().render().$el);
            });
        },
    
        showJQGrid:function(){
            require(["jQueryGridView"], function(JQueryGridView){
                $(".main-root").empty().append(new JQueryGridView().render().$el);
            });
        },
        handleSample:function(){
             $(".main-root").empty().append(new Sample().render().$el);
        },
        
        initialize:function(){
        
            i++;
        },
    
        getNumber:function(){
            return i;
        }

    }); 
    
    var appRouter = new AppRouter();

    require(['json!localization/ui-text-ZH.json'],function(json){
        Backbone.__initI18n(json);

     var __config = [
         {"label":Backbone.getI18n('app.grid.gridDemo'), "link": "#grid", children:[{"label":Backbone.getI18n('app.grid.jqGrid'), "link": "/jqGrid"},{"label":Backbone.getI18n('app.grid.nGrid'), "link": "/nGrid"}]},
         {"label":Backbone.getI18n('app.form.formDemo'), "link": "#form",children:[{"label":Backbone.getI18n('app.form.BDropDown'), "link": "/b-dropdown"},{"label":Backbone.getI18n('app.form.InputList'), "link": "/inputlist"}]},
         {"label":"示例", "link": "#sample"}
    ];


        $(".nav-root").append( new Navigation(__config).render().$el);
    });
    

    Backbone.history.start();
    return appRouter;
    
});