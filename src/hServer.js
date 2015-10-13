"use strict";

var http = require("http")
var https = require("https")
var url = require("url");
var path = require("path")
var fs = require("fs");
var crypto = require("crypto");
var zlib = require('zlib');

var argv = process.argv.slice();
var httpMode = true;
var cacheMode = false;

argv.forEach(function(item){
    if (/^--/.test(item)) {
      switch(item) {
        case "--http":
        httpMode = true;
        break;
        case "--https":
        httpMode = false;
        break;
      }
      console.log(item);
    }
});


argv = argv.filter(function(item){
    return !/^--/.test(item);
});

var port = parseInt(argv[2]) || 8079;

var targetHostSetting = {
  hostname: argv[3] || "http://10.128.214.145",
  port: parseInt(argv[4]) || 9001,
  https: false

};

// var targetHostSetting = {
//   hostname: argv[3] || "https://10.128.214.61",
//   port: parseInt(argv[4]) || 9002,
//   https: true

// };


if (/^https:\/\//.test(targetHostSetting.hostname)) {
  targetHostSetting.hostname = targetHostSetting.hostname.replace(/^https:\/\//, "");
  targetHostSetting.https = true;
  httpMode = false;
} else if (/^http:\/\//.test(targetHostSetting.hostname)) {
  targetHostSetting.hostname = targetHostSetting.hostname.replace(/^http:\/\//, "");
}

var MIME = {
    "js": "application/javascript",
    "json": "application/json",
    "mp3": "audio/mpeg",
    "ogg": "audio/ogg",
    "wav": "audio/x-wav",
    "gif": "image/gif",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "svg": "image/svg+xml",
    "ico": "image/x-icon",
    "html": "text/html",
    "htm": "text/html",
    "txt": "text/plain",
    "text": "text/plain",
    "css": "text/css",
    "csv": "text/csv",
    "less": "text/css",
    "mp4": "video/mp4"
};


function serverCb(req, res) {
  console.log(req.url);
  var isResourceURL = /\/_ui/.test(req.url);


  // if (!isResourceURL) {

  //     var requestCache = {
  //       timeStamp: Date.now(),
  //       // hostname: targetHostSetting.hostname,
  //       // port: targetHostSetting.port,
  //       path: req.url,
  //       method: req.method,
  //       headers: req.headers,
  //       force: false
  //     };

  //     var reqProxy = (targetHostSetting.https? https : http ).request({
  //         hostname: targetHostSetting.hostname ,
  //         port: targetHostSetting.port ,
  //         path:  req.url,
  //         method: req.method,
  //         headers: req.headers,
  //         rejectUnauthorized: false
  //       }, function(resProxy) {

  //         if (Math.floor( resProxy.statusCode/100) === 2) {
  //           res.statusCode = resProxy.statusCode;
  //           for( var headerItem in resProxy.headers) {
  //             res.setHeader( headerItem, resProxy.headers[headerItem]);
  //           }
  //           var data = [];

  //           resProxy.on("data", function(chunk) {
  //               res.write(chunk);
  //               data.push(chunk);
  //           });
  //           resProxy.on("end", function(){
  //               res.end();

  //           });
  //         } 
  //         else {

  //             res.statusCode = resProxy.statusCode;
  //             for( var headerItem in resProxy.headers) {
  //               res.setHeader( headerItem, resProxy.headers[headerItem]);
  //             }
  //             resProxy.on("data", function(chunk) { 
  //               res.write(chunk); });
  //             resProxy.on("end", function(){ 
  //               res.end(); })
            
  //         }
  //     });

  //     reqProxy.on("error", function(e) {
       
  //           res.statusCode = 500;
  //           res.write( e.message );
  //           res.end();
         
  //     });

  //     req.on("data", function(chunk) {
  //         reqProxy.write(chunk);
  //     });

  //     req.on("end", function() {
  //         reqProxy.end();
  //     });

  // } else {
    // get the file

    var prePath = "/common",relativeFileName;

    if(req.url.indexOf("/common") >= 0){
       relativeFileName = "." + req.url.slice(req.url.indexOf("/common") + "/common".length);
    }else{
        relativeFileName = "." + req.url;
    }

   

    var ext = path.extname(relativeFileName).toLowerCase().replace("." , "");
    var mime = MIME[ext] || MIME["text"];

    var raw = fs.createReadStream(relativeFileName,"utf-8");
    raw.on("open", function(){
        res.writeHead(200, {
            'Content-Type': mime,
            'content-encoding': 'gzip'
        });
    });
    raw.on("error", function(err){
        res.writeHead(404);
        res.end("Internal error: " + err);
    });

    raw.pipe(zlib.createGzip()).pipe(res);

  // };

};

var server = httpMode ? http.createServer(serverCb) : https.createServer({
    key: fs.readFileSync('/Users/i054410/Documents/develop/self-cert/key.pem'),
    cert: fs.readFileSync('/Users/i054410/Documents/develop/self-cert/cert.pem')
}, serverCb);
  
server.listen(port, '0.0.0.0');

console.log('Server running at 127.0.0.1:' + port + '/');
