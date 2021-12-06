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

    // var getParams = {
    //     Bucket: 'artiontestbucket',
    //     Key: 'kigNFT2.png'
    // }

    // var picURL = "https://" + getParams.Bucket + ".s3.amazonaws.com/" + getParams.Key;

    var picURL = s3.getSignedUrl('getObject', getParams);
    
    console.log(picURL);

    res.render('general/item', {picURL: picURL});
});

module.exports = router;


