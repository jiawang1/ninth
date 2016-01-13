 require.config({
                        baseUrl: "js",
                        paths: {
                            jquery: 'lib/jquery-1.11.2', 
                            underscore: 'lib/underscore',
                            Backbone: 'lib/backbone-1.1.2',
                            bootstrap: 'lib/bootstrap',
                            backbone: 'lib/ninth',
                            datatables:'lib/jquery.dataTables',
                            accessible:'lib/jquery.accessible-tabs-1.9.7.min',
                            json:'lib/json',
                            babel:'lib/babel-5.8.22.min',
                            jsx:'lib/jsx',
                            jqGrid:'widget/jquery.jqgrid.src',
                            text:"lib/text",
                            dropDown:"lib/dropdown",
                            react:"lib/react",
                            reactDOM:"lib/react-dom"

                        },
                        shim: {
                            underscore: {
                                exports: '_'
                            },
                            Backbone: {
                                deps: ["underscore", "jquery"],
                                exports: "Backbone"
                            },
                            backbone:{
                                deps: ["Backbone", "jquery"],
                                exports: "backbone"
                            },
                            bootstrap:{
                                deps: ["jquery"],
                                exports: "bootstrap"
                            },
                            datatables:{
                            	deps: ['jquery']
                            },
                            accessible:{
                                deps: ['jquery']
                            },
                            jqGrid:{
                                deps: ['jquery']
                            },
                            dropDown:{
                                deps: ['jquery', 'bootstrap']
                            }
                        },
                         map: {
                              '*': {
                                'css': 'lib/css'
                              } 
                            }
                    });

        require(["applicationRouter", 
                 'css!../css/bootstrap.css', 
                 'css!../css/relayout.css',
                 'css!../css/style.css',
                 'jsx!helloworld.jsx'
                ], function (router) {
            console.log("finish application");
        });

    
