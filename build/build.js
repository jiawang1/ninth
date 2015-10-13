({
    baseUrl: "./../src/js",
    name: "application",
    mainConfigFile:"./../src/js/application.js",
    optimize :"uglify2",
    generateSourceMaps :true,
    preserveLicenseComments :false,
    isBuild:true,
    out: "application.min.js"
})