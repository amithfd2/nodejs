var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var colors = require('colors');
require('dotenv').config();
var passport = require('passport');
require('./models/models');
var index = require('./routes/index');
var mongoose = require('mongoose');
var socket_io = require("socket.io");


var app = express();
var io = socket_io();
app.io = io;

io.on('connection', function(client) {
    console.log('Client connected...'.green);
    /*client.on('disconnect', function () {
        console.log("Client disconnected".red);
    });*/
    client.on('chat message', function (msg) {
        console.log("message :"+msg)
        io.emit('chat message', msg);
    })
    });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(session({
    secret: 'keyboard cat'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
initPassport(passport);
app.use('/', index);

app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
module.exports = app;
