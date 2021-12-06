const router = require('express').Router();

var AWS = require('aws-sdk');
var uuid = require('uuid');
var s3 = new AWS.S3();


router.get(['/','/home'],(req,res) => {
    res.render('general/home');
});

router.get(['/','/item'],(req,res) => {

    var getParams = {
        Bucket: 'artionstoragebucket',
        Key: 'kigNFT.png'
    }

    var getParams = {Bucket: 'artionstoragebucket', Key: 'kigNFT.png'};
    var picURL = s3.getObject();
    console.log(picURL);
    // ('getObject', getParams);

    res.render('general/item', picURL);
});

module.exports = router;


