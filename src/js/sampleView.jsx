define(['jquery', 'backbone', 'underscore','react','reactDOM','jsx!widget/dropDown.jsx','text!../template/sampleTpl.html'
  ], function($, Backbone, _, React,ReactDOM, DropDown, sSampleTemplate) {
  "use strict";

  var SampleView = Backbone.View.extend({ /* create view class*/

    $el: $("<div>"),
    initialize: function() { /* constructor for this class*/

    },

    render: function() {

      var that = this; /* render the view*/
      //            _.templateSettings={
      //
      //                interpolate: /\{\{(.+?)\}\}/g
      //            };

      // $.when(new ProductModel().fetch()).done(function(model){

      //    that.$el.html(_.template(sSampleTemplate,{"model": model}));

      //    $(".input-list",that.$el).inputList({"label":'category'},['a','b']);


      // });

      that.$el.html(_.template(sSampleTemplate, {
        "model": {}
      }));
      that.$el.append("<div class='jsx-container'>");
      that.$el.append("<div class='dropMenu-container'>");

      // console.log(DropDown);
      var d1 = ReactDOM.render(<DropDown />, $(".jsx-container", that.$el )[0]);
      ReactDOM.render(<DropDown />, $(".dropMenu-container", that.$el )[0]);
    
      return this;
    }

  });

  return SampleView; /* expose class */
});