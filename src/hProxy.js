"use strict";

var http = require("http"),
 https = require("https"),
 url = require("url"),
 path = require("path"),
 fs = require("fs"),
 crypto = require("crypto"),
 zlib = require('zlib');

var argv = process.argv.slice();
 httpMode = true;
 cacheMode = false;

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

var port = parseInt(argv[2]) || 9090;

var targetHostSetting = {
  hostname: argv[3] || "http://10.59.170.119",
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

// var cachedRequests = {};
// var cachedRequestsUpdated = false;


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


function app(req, res) {
  console.log(req.url);
  var isResourceURL = /\/_ui/.test(req.url);


  if (!isResourceURL) {

      var requestCache = {
        timeStamp: Date.now(),
        // hostname: targetHostSetting.hostname,
        // port: targetHostSetting.port,
        path: req.url,
        method: req.method,
        headers: req.headers,
        force: false
      };

      var reqProxy = (targetHostSetting.https? https : http ).request({
          hostname: targetHostSetting.hostname ,
          port: targetHostSetting.port ,
          path:  req.url,
          method: req.method,
          headers: req.headers,
          rejectUnauthorized: false
        }, function(resProxy) {

          if (Math.floor( resProxy.statusCode/100) === 2) {
            res.statusCode = resProxy.statusCode;
            // if (resProxy.headers["set-cookie"] instanceof Array) {
            //   resProxy.headers["set-cookie"] = resProxy.headers["set-cookie"].map(function(cookie) {
            //       return cookie.replace("Secure;","");
            //   });
            // }
            for( var headerItem in resProxy.headers) {
              res.setHeader( headerItem, resProxy.headers[headerItem]);
            }
            // requestCache.res = {
            //   statusCode: resProxy.statusCode,
            //   headers: resProxy.headers,
            //   type: resProxy.headers["content-encoding"]==="gzip" ? "binary" : (/json|text/.exec( resProxy.headers["content-type"] ) || ["binary"])[0]
            // };
            var data = [];

            resProxy.on("data", function(chunk) {
                res.write(chunk);
                data.push(chunk);
            });
            resProxy.on("end", function(){
                res.end();
                // var reqData = Buffer.concat(data).toString( requestCache.res.type !== "binary"? "utf-8" : "base64");
                // try{
                //   requestCache.res.data = requestCache.res.type === "json" ? JSON.parse( reqData ) : reqData;
                //   requestCache.res.checksum = crypto.createHash("md5").update(reqData).digest('hex');
                //   if ( !cachedRequestArray ) {
                //     cachedRequests[cachedRequestKey] = [requestCache];
                //     cachedRequestsUpdated = true;
                //   } else {
                //     if (cachedRequestArray.every(function(cached) {
                //           return cached.res.checksum !== requestCache.res.checksum;
                //     })){
                //       cachedRequestArray.push( requestCache );
                //       cachedRequestArray.splice(0, cachedRequestArray.length - 3 );
                //       cachedRequestsUpdated = true;
                //     }
                //   }
                // } catch(err) {
                //   console.error("[ERROR] Response parse failed: " + err);
                // }

            });
          } 
          // else if(Math.floor(resProxy.statusCode/100) === 3){
              
          //     var oUrl = url.parse(resProxy.req.__inspector_url__);
          //     if(oUrl.hostname === "localhost"){
          //         res.statusCode = resProxy.statusCode;
          //         oUrl.port = port;
          //         (oUrl.protocol.substring(0, oUrl.protocol.length - 1) == "http"?http:https).request({
          //             hostname: targetHostSetting.hostname ,
          //             port: targetHostSetting.port ,
          //             path:  resProxy.req.__inspector_url__,
          //             method: resProxy.req.method,
          //             headers: resProxy.req._headers,
          //             rejectUnauthorized: false

          //         },function(_res){



          //         });


          //     }



          // }
          else {

              res.statusCode = resProxy.statusCode;
              for( var headerItem in resProxy.headers) {
                res.setHeader( headerItem, resProxy.headers[headerItem]);
              }
              resProxy.on("data", function(chunk) { 
                res.write(chunk); });
              resProxy.on("end", function(){ 
                res.end(); })
            
          }
      });

      reqProxy.on("error", function(e) {
       
            res.statusCode = 500;
            res.write( e.message );
            res.end();
         
      });

      req.on("data", function(chunk) {
          reqProxy.write(chunk);
      });

      req.on("end", function() {
          reqProxy.end();
      });

  } else {
    // get the file


    var relativeFileName = "." + req.url.slice(req.url.indexOf("/_ui"));

    var ext = path.extname(relativeFileName).toLowerCase().replace("." , "");
    var mime = MIME[ext] || MIME["text"];

    var raw = fs.createReadStream(relativeFileName);
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
    // fs.readFile(filePath, function (err, data) {
    //     if(err) {
    //       res.writeHead(404);
    //       res.end("Internal error: " + err);
    //     } else {
    //       res.writeHead(200, {
    //           'content-type': mime
    //       });
    //       res.end(data);
    //     }
    // });
  };

};

var server = httpMode ? http.createServer(app) : https.createServer({
    key: fs.readFileSync('/Users/i054410/Documents/develop/self-cert/key.pem'),
    cert: fs.readFileSync('/Users/i054410/Documents/develop/self-cert/cert.pem')
}, app);
  
server.listen(port, '0.0.0.0');

console.log('Server running at 127.0.0.1:' + port + '/');
