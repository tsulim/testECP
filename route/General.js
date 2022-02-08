const router = require('express').Router();
const AWS = require('aws-sdk');
const credentials = require('../config/credential');

AWS.config.update({ 
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key,
    sessionToken: process.env.aws_session_token,
    endpoint: "http://localhost:3000",
    region: "us-east-1"
});

const dynamoDB = new AWS.DynamoDB.DocumentClient({ credentials });

router.get(['/','/home'],(req,res) => {
    res.render('general/home');
});

router.get(['/create'],(req,res) => {
    res.render('general/createnft');
});

router.post(['/createNFT'], (req, res) => {
    var title = req.body.nftTitle;
    var description = req.body.nftDescription;

    dynamoDB
        .put({
            Item: {
                Title: title,
                FilePath: "",
                Genre: "",
                CurrentBid: 0,
                Artist: "user",
                Description: description,
            },
            TableName: "NFT"
        })
        .promise()
        .then(data => console.log(data.Attributes))
        .catch(console.error)
    
    res.render('general/createCollab');
});

module.exports = router;