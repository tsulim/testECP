const router = require('express').Router();
const multer = require('multer');
const path = require("path");
const fs = require("fs");
const S3_Client = require("../api/S3");
const Cognito_Client = require("../api/Cognito");
const {LoginAPI, RegisterAPI, RegisterConfirmAPI, LogoutAPI} = require("../api/Affinidi");

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

const upload = multer({storage: storage, fileFilter: filefilter}).fields([{ name: 'avatar', maxCount: 1 }, { name: 'other_proof', maxCount: 1 }]);

router.get("/signin",(req,res) => {
    return res.render('auth/signin', {
        title: "ArTion - Sign In"
    });
});

router.get("/signup",(req,res) => {
    return res.render('auth/signup', {
        title: "ArTion - Sign Up",
    });
});

router.get("/confirmation/:type", (req,res) => {
    const {type} = req.params;
    const {username, k} = req.query;

    var form_err_msg = "";
    if (type === "auth") {
        form_err_msg = "An OTP has been sent to "+username+". This OTP is to verify your email.";
    } else {
        form_err_msg = "An OTP has been sent to "+username+". This OTP is so as to issue you're user ID.";
    }

    return res.render('auth/verifyemail',{
        title: "ArTion - Confirmation",
        username,
        token: k,
        type,
        form_err_msg,
    });
});

router.get("/logout", (req,res) => {
    LogoutAPI().then(resp => {
        return res.redirect("signin");
    }).catch(err => {
        console.log(err);
        return res.redirect("/");
    });
});

// Post methods
router.post("/signin",(req,res) => {
    const {email, password} = req.body;
    const params = {
        username: email,
        password: password
    };

    if (!(/^\w+[\+\.\w-]*@([\w-]+\.)*\w+[\w-]*\.([a-z]{2,4}|\d+)$/i.test(email))) {
        return res.render('auth/signin', {
            title: "ArTion - Sign In",
            form_err_msg: "Email format is invalid",
        });
    } else if (!(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/.test(password))) {
        return res.render('auth/signin', {
            title: "ArTion - Sign In",
            form_err_msg: "Password format is invalid",
        });
    };

    InitCognito.GetUser(params).then(resp =>{
        if (resp.UserStatus === "CONFIRMED") {
            InitCognito.LoginUser(params).then(_ => {
                LoginAPI(params).then(_ => {
                    return res.redirect("/");
                }).catch((err) => {
                    if (err.httpStatusCode === 404) {
                        RegisterAPI(params).then(resp => {
                            const formatemail = encodeURIComponent(username);
                            const token = encodeURIComponent(resp.token);
                            return res.redirect("confirmation/did?username="+formatemail+"&k="+token);
                        }).catch(err => {
                            console.log(err);
                            return res.render('auth/signin', {
                                title: "ArTion - Sign In",
                                form_err_msg: "Incorrect username or password"
                            });
                        });
                    } else {
                        console.log(err);
                        return res.render('auth/signin', {
                            title: "ArTion - Sign In",
                            form_err_msg: "Incorrect username or password"
                        });
                    };
                });
            }).catch(err => {
                console.log(err);
                return res.render('auth/signin', {
                    title: "ArTion - Sign In",
                    form_err_msg: "Incorrect username or password"
                });
            });
        } else if (resp.UserStatus === "UNCONFIRMED") {
            const formatemail = encodeURIComponent(params.username);
            return res.redirect("confirmation/auth?username="+formatemail);
        } else {
            return res.render('auth/signin', {
                title: "ArTion - Sign In",
                form_err_msg: "Incorrect username or password"
            });
        };
    }).catch(err => {
        console.log(err);
        return res.render('auth/signin', {
            title: "ArTion - Sign In",
            form_err_msg: "Incorrect username or password" 
        });
    });
});

// Creating cpUpload to allow upload of two files, avatar and other proof
router.post("/signup", upload, (req,res) => {
    // Extracting form data
    const {email, username, password, cfmpassword, instagram, twitter} = req.body;
    
    if (!(/^\w+[\+\.\w-]*@([\w-]+\.)*\w+[\w-]*\.([a-z]{2,4}|\d+)$/i.test(email))) {
        return res.render('auth/signup', {
            title: "ArTion - Sign Up",
            form_err_msg: "Email format is invalid",
        });
    } else if (!(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/.test(password))) {
        return res.render('auth/signup', {
            title: "ArTion - Sign Up",
            form_err_msg: "Password format is invalid"
        });
    } else if (password !== cfmpassword) {
        return res.render('auth/signup', {
            title: "ArTion - Sign Up",
            form_err_msg: "Password do not match"
        });
    } else if (!(/^\@{1}([a-zA-Z0-9]+[^a-zA-Z0-9\s]*)$/.test(twitter))) {
        return res.render('auth/signup', {
            title: "ArTion - Sign Up",
            form_err_msg: "Twitter format is invalid"
        });
    } else if (!(/^\@{1}([a-zA-Z0-9]+[^a-zA-Z0-9\s]*)$/.test(instagram))) {
        return res.render('auth/signup', {
            title: "ArTion - Sign Up",
            form_err_msg: "Instagram format is invalid"
        });
    };
    
    // Extracting information required to push to bucket
    // Starting with the user avatar image
    if (req.files.avatar) {
        const {filename:avfilename,originalname:avoriginalname,mimetype:avmimetype,destination:avdestination} = req.files.avatar[0];
        if (!(/.png|.jpeg|.jpg/.test(path.extname(avoriginalname).toLowerCase()))) {
            return res.render('auth/signup', {
                title: "ArTion - Sign Up",
                form_err_msg: "Avatar file format is not accepted. Only accepts png, jpg and jpeg"
            });
        };
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
        const {filename:opfilename,originalname:oporiginalname,mimetype:opmimetype,destination:opdestination} = req.files.other_proof[0];
        if (!(/.txt|.pdf/.test(path.extname(oporiginalname).toLowerCase()))) {
            return res.render('auth/signup', {
                title: "ArTion - Sign Up",
                form_err_msg: "Avatar file format is not accepted. Only accepts txt and pdf"
            });
        };
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
        password: password,
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
            return res.redirect('signin');
        } else {
            return res.redirect('signup');
        };
    }).catch(err => {
        console.log(err);
        return res.redirect('signup');
    });

});

router.post("/confirmation/:type", (req,res) => {
    const {type} = req.params;
    const {username, otp, token} = req.body;
    
    if (type === "did") {
        const params = {
            token: token,
            otp: otp,
        };
        RegisterConfirmAPI(params).then((resp) => {
            return res.redirect("/")
        }).catch((err) => {
            console.log(err);
            return res.redirect("did?username="+formatemail+"&k="+token);
        });
    } else if (type === "auth") {
        const params = {
            username: username,
            otp: otp
        };
        InitCognito.VerifyEmail(params).then(resp=>{
            if (process.env.NODE_ENV === "dev") {
                console.log(resp);
            };
            if (resp["$metadata"].httpStatusCode === 200) {
                return res.redirect("signin");
            } else {
                const formatemail = encodeURIComponent(username);
                return res.redirect('auth?username='+formatemail);
            }
        }).catch(err=>{
            if (err.name === "CodeMismatchException") {
                const formatemail = encodeURIComponent(username);
                return res.redirect('auth?username='+formatemail);
            };
        });
    } else {
        return res.redirect("signin");
    };
});

router.post("/getemail", (req,res) => {
    if (req.get("referer") === "http://localhost:3000/auth/signup" || req.get("referer") === "https://localhost:3000/auth/signup") {
        const {username} = req.body;
        InitCognito.GetUser({username}).then(resp => {
            return res.json({exists: true});
        }).catch(err => {
            return res.json({exists: false});
        });
    } else {
        return res.redirect(req.get("referer"));
    };
});

module.exports = router;