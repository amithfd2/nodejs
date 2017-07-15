var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var Post = mongoose.model('Post');
var colors = require("colors");

router.get('/', function(req, res) {
        res.render('index', {
            title: "Chirp",
            user:{
                username : "test"
            }
        });
});
router.get('/login', function (req, res) {
    res.render('login', { title: "Chater"});
});


module.exports = router;
