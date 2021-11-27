const router = require('express').Router();
const multer = require('multer');
const path = require("path");
const fs = require("fs");
const S3_Client = require("../api/S3api");
const Cognito_Client = require("../api/Cognitoapi");

const InitS3 = new S3_Client();
const InitCognito = new Cognito_Client();

const filefilter = (req, file, cb) => {
    const mimetype = file.mimetype;
    const ext = path.extname(file.originalname).toLowerCase();
    var amt,amt_regex;
    switch (file.fieldname) {
        case "avatar":
            amt = ['image/png','image/jpeg','image/jpg'];
            amt_regex = /.png|.jpeg|.jpg/;
            if (amt.indexOf(mimetype) > -1 && amt_regex.test(ext)) {
                cb(null, true);
            } else {
                cb(null, false);
            };
            break;
        case "other_proof":
            amt = ['text/plain','application/pdf'];
            amt_regex = /.txt|.pdf/;
            if (amt.indexOf(mimetype) > -1 && amt_regex.test(ext)) {
                cb(null, true);
            } else {
                cb(null, false);
            };
            break;
        default: 
            cb(null, false);
            break;
    };
};

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

const upload = multer({storage: storage, fileFilter: filefilter});

router.get("/signin",(req,res) => {
    res.render('auth/signin', {
        title: "ArTion - Sign In"
    });
});

router.get("/confirmation", (req,res) => {
    const {username} = req.query;
    res.render('auth/verifyemail',{
        title: "ArTion - Confirmation",
        username:username
    });
});

router.get("/signup",(req,res) => {
    res.render('auth/signup', {
        title: "ArTion - Sign Up",
    });
});

router.post("/signin",(req,res) => {
    const {username, password} = req.body;
    const params = {
        username: username,
        password: password
    };
    InitCognito.LoginUser(params).then(resp => {
        if (process.env.NODE_ENV === "dev") {
            console.log(resp);
        };
    }).catch(err => {
        if (err.name === "UserNotConfirmedException") {
            const formatemail = encodeURIComponent(username);
            res.redirect("confirmation?username="+formatemail);
        } else {
            res.redirect("signin");
        };
    });
});

// Creating cpUpload to allow upload of two files, avatar and other proof
router.post("/signup", upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'other_proof', maxCount: 1 }]), (req,res) => {
    // Extracting form data
    const {email, username, instagram, twitter} = req.body;
    
    // Extracting information required to push to bucket
    // Starting with the user avatar image
    if (req.files.other_proof) {
        const {filename:avfilename,mimetype:avmimetype,destination:avdestination} = req.files.avatar[0];
        // Reading the avatar binary
        const avbinary = fs.readFileSync(`${avdestination}/${avfilename}`);
        // Being insert operation for avatar
        InitS3.InsertFile(`${email}/${avfilename}`,avmimetype,avbinary).then((_) => {
            fs.unlinkSync(`${avdestination}/${avfilename}`);
        }).catch((err) => {
            console.log(err);
        });
    };
    
    // Then followed by user other proof
    if (req.files.other_proof) {
        const {filename:opfilename,mimetype:opmimetype,destination:opdestination} = req.files.other_proof[0];
        // Reading the other proof binary
        const opbinary = fs.readFileSync(`${opdestination}/${opfilename}`);
        // Being insert operation for other proof
        InitS3.InsertFile(`${email}/${opfilename}`,opmimetype,opbinary).then((_) => {
            fs.unlinkSync(`${opdestination}/${opfilename}`);
        }).catch((err) => {
            console.log(err);
        });
    };

    // Setting up form body for cognito to render
    const params = {
        username: email,
        nickname: username,
        password: "P@55w0rd",
        picture: req.files.avatar?`${email}/${req.files.avatar[0].filename}`:"",
        twitter: twitter,
        instagram: instagram, 
        other_proof: req.files.other_proof?`${email}/${req.files.other_proof[0].filename}`:"",
    };

    InitCognito.CreateUser(params).then(resp => {
        if (process.env.NODE_ENV === "dev") {
            console.log(resp);
        };
        if (resp["$metadata"].httpStatusCode === 200) {
            res.redirect('signin');
        } else {
            res.redirect('signup');
        };
    }).catch(err => {
        console.log(err);
        res.redirect('signup');
    });

});

router.post("/confirmation", (req,res) => {
    const {username, otp} = req.body;
    const params = {
        username: username,
        otp: otp
    };
    InitCognito.VerifyEmail(params).then(resp=>{
        if (process.env.NODE_ENV === "dev") {
            console.log(resp);
        };
        if (resp["$metadata"].httpStatusCode === 200) {
            res.redirect("signin");
        } else {
            const formatemail = encodeURIComponent(username);
            res.redirect('confirmation?username='+formatemail);
        }
    }).catch(err=>{
        if (err.name === "CodeMismatchException") {
            console.log(err);
            const formatemail = encodeURIComponent(username);
            res.redirect('confirmation?username='+formatemail);
        };
    });
});


module.exports = router;