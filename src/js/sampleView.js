define(['jquery', 'backbone', 'underscore', 'text!../template/sampleTpl.html'
  ], function($, Backbone, _, sSampleTemplate) {
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

      return this;
    }

  });

  return SampleView; /* expose class */
});