define(['jquery','backbone', 'underscore','text!../template/nGridTpl.html'],function($,Backbone,_,sGridTpl){
    "use strict";
    
        var GridView = Backbone.View.extend({
        
        $el:$("<div>"),
        initialize:function(){                      /* constructor for this class*/

        },
        
        render:function(){
             this.$el.html(_.template(sGridTpl));

               var colList = [{
                      "name": "Name",
                      "description": "Name",
                      "type": "text",
                      "width": "25%"
                    }, {
                      "name": "Purpose",
                      "description": "Purpose",
                      "type": "text",
                      "width": "25%"
                    }, {
                      "name": "Version",
                      "description": "Version",
                      "type": "text",
                      "width": "25%"
                    }, {
                      "name": "TenantCount",
                      "description": "TenantCount",
                      "type": "text",
                      "width": "25%",
                      "dataType": "number"
                    },

                  ];

      var n = 0;
      var gridDelegate = {
        autoResize: function() {
          return 540;
        },
        getHeaderSpec: function() {
          return colList;
        },
        getRowCount: function() {
          return 10;
        },
        getRow: function(idx) {
          return [{
            "Name": "Jay",
            "Purpose": "work"
          }, {
            "Name": "wang",
            "Purpose": "work"
          }];
        },
        getGridHeight: function() {
          return 200;
        },
        getDefaultSelectedIndex: function() {
          return 1;
        },
        getCell: function() {
          n++;
          var retVal = "tsest a " + (n++);
          if (this.colName === "TenantCount") {
            return n;
          }
          return retVal;
        }
      };

      $(".tab",this.$el).gridview({ delegate: gridDelegate }).show();   
            return this;
        },
        destroy:function(){
        
        }
        
    });
    
    return GridView;
        

    
});