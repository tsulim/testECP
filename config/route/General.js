const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const S3API = require('../api/S3');
const DynamoDBAPI = require('../api/DynamoDB');

const S3 = new S3API();
const DynamoDB = new DynamoDBAPI();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const {email} = req.body;
        let storepath = `./public/tmp/${email}`;
        if (!fs.existsSync(storepath)){
            fs.mkdirSync(storepath);
            cb(null, storepath);
        } else {
            cb(null, storepath);
        };
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, file.fieldname+ext);
    },
});

const upload = multer({storage: storage}).fields([{name: 'mediaFile', maxCount:1}]);


router.get(['/','/home'],(req,res) => {
    res.render('general/home');
});

router.get(['/create'],(req,res) => {
    res.render('general/createnft');
});

router.post('/createNFT', upload, (req, res) => {
    var title = req.body.nftTitle;
    var description = req.body.nftDescription;

    var randomNo = Math.floor(Math.random() * 5000);
    var destination = req.files.mediaFile[0]['destination'];
    var filename = req.files.mediaFile[0]['filename'];
    var s3FileKey = `user-${randomNo}-${req.files.mediaFile[0]['originalname']}`;

    var s3Params = {
        Key: s3FileKey,
        Body: fs.readFileSync(`${destination}/${filename}`),
        ContentType: req.files.mediaFile[0]['mimetype'],
    }

    S3.putItem('ecpbucket-192726q',s3Params).then((_) => {
        fs.unlinkSync(`${destination}/${filename}`);
    }).catch((err) => {
        console.log("S3 error - " + err);
    });


    const params = {
        Item: {
            id: {"S": "handsomefellow"},
            Title: {'S':title},
            FilePath: {'S':s3FileKey},
            Genre: {'S':"Something"},
            CurrentBid: {'S':"0"},
            Artist: {'SS':["user"]},
            Description: {'S':description},
        }
    }

    DynamoDB.putItem("NFT", params)
    .then(resp => {
        console.log(resp);
        return res.render('general/createCollab');
    })
    .catch(err => {
        console.log("DynamoDB error " + err);
        return res.render('general/createnft');
    });
});

router.get(['/noCollab'],(req,res) => {
    res.render('general/createSuccess');
});

router.get(['/haveCollab'],(req,res) => {
    res.render('general/create');
});

module.exports = router;