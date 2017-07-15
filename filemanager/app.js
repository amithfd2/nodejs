/**
 * Created by SOFTMAN on 01-07-2017.
 */

var express = require("express"),
    app = express(),
    fs = require("fs"),
    bodyParser = require("body-parser"),
    path = require('path'),
    logger = require("morgan");
var ngrok = require('ngrok');
ngrok.connect({proto: 'http', addr: 3000, }, function (err, url) {
    if(err) console.log(err)
    console.log("Remote url: "+url)
}); // https://757c1652.ngrok.io -> http://localhost:9090 


app.set('views', path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

require("./routes/routes.js")(express, app);

var port = process.env.PORT || 3000 ;

app.listen(port, function () {
    console.log("browse at http://localhost:"+port+"/")
});