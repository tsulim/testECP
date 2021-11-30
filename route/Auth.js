const router = require('express').Router();
const multer = require('multer');
const path = require("path");
const fs = require("fs");
const S3API = require("../api/S3");
const AffinidiAPI = require("../api/Affinidi");

const S3 = new S3API();
const Affinidi = new AffinidiAPI();

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
        case "proof":
            amt = ['application/pdf'];
            amt_regex = /.pdf/;
            if (mimetype === 'application/pdf' && amt_regex.test(ext)) {
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

const upload = multer({storage: storage, fileFilter: filefilter}).fields([{ name: 'avatar', maxCount: 1 }, { name: 'proof', maxCount: 1 }]);

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

router.get("/downloadform", (req,res) => {
    res.download('./public/images/template.docx');
});

router.get("/confirmation", (req,res) => {
    const {k} = req.query;
    if (!k){
        return res.status(400).redirect("signin");
    };

    return res.render('auth/verifyemail',{
        title: "ArTion - Confirmation",
        username,
        token: k,
        form_err_msg: "An OTP has been sent to "+username,
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
    const {username, password} = req.body;
    const params = {
        username: username,
        password: password
    };

    if (!(/^\w+[\+\.\w-]*@([\w-]+\.)*\w+[\w-]*\.([a-z]{2,4}|\d+)$/i.test(username))) {
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
    
    Affinidi.StartAuth(params).then(resp => {
        if (process.env.NODE_ENV === "dev") {
            console.log(resp);
        };
        return res.redirect('/');
    }).catch(err => {
        console.log(err);
        return res.render('auth/signin', {
            title: "ArTion - Sign In",
            form_err_msg: "Incorrect username or password",
        });
    });
    /*
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
    */
});

// Creating cpUpload to allow upload of two files, avatar and other proof
router.post("/signup", upload, (req,res) => {
    // Extracting form data
    const {email, username, password, cfmpassword} = req.body;

    const params = {
        username: email,
        password: password,
    };
    
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
        // Being insert operation for avatar
        S3.InsertFile(`${email}/${avfilename}`,avmimetype,fs.readFileSync(`${avdestination}/${avfilename}`)).then((_) => {
            fs.unlinkSync(`${avdestination}/${avfilename}`);
        }).catch((err) => {
            console.log(err);
        });
    };
    
    // Then followed by user proof
    if (req.files.proof) {
        const {filename:opfilename,originalname:oporiginalname,mimetype:opmimetype,destination:opdestination} = req.files.other_proof[0];
        if (!(/.pdf/.test(path.extname(oporiginalname).toLowerCase()))) {
            return res.render('auth/signup', {
                title: "ArTion - Sign Up",
                form_err_msg: "Avatar file format is not accepted. Only accepts pdf"
            });
        };
        // Reading the other proof binary
        // Being insert operation for other proof
        S3.InsertFile(`${email}/${opfilename}`,opmimetype,fs.readFileSync(`${opdestination}/${opfilename}`)).then((_) => {
            fs.unlinkSync(`${opdestination}/${opfilename}`);
        }).catch((err) => {
            console.log(err);
        });
    };

    Affinidi.SignUp(params).then(resp => {
        if (process.env.NODE_ENV === "dev") {
            console.log(resp);
        };
        return res.redirect("confirmation?k="+resp.token);
    }).catch(err => {
        console.log(err);
        return res.render('auth/signup', {
            title: "ArTion - Sign Up",
            form_err_msg: "Please try again"
        });
    });

    /*
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
    */

});

router.post("/confirmation", (req,res) => {
    const {otp, token} = req.body;
    
    const params = {
        token: token,
        confirmationCode: otp
    };

    if (!(/[a-zA-Z0-9]{6}/.test(otp))) {
        return res.render('auth/verifyemail', {
            title: "ArTion - Confirmation",
            form_err_msg: "OTP format is invalid"
        });
    } else if (token.length < 1) {
        return res.render('auth/verifyemail', {
            title: "ArTion - Confirmation",
            form_err_msg: "Please try again"
        });
    };

    Affinidi.ConfirmSignUp(params).then(resp => {
        if (process.env.NODE_ENV === "dev") {
            console.log(resp);
        };
        res.redirect("signin");
    }).catch(err => {
        console.log(err);
        return res.render('auth/verifyemail', {
            title: "ArTion - Confirmation",
            form_err_msg: "Please try again"
        });
    });

    /*
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
    */
});

router.post("/getemail", (req,res) => {
    const {username} = req.body;
    
    const params = {
        username: username,
        password: "P@55w0rd"
    };

    Affinidi.SignUp(params).then(resp => {
        if (process.env.NODE_ENV === "dev") {
            console.log(resp);
        };
        return res.json({exists:false});
    }).catch(err => {
        console.log(err);
        return res.json({exists:true});
    });

    /*
    InitCognito.GetUser({username}).then(resp => {
        return res.json({exists: true});
    }).catch(err => {
        return res.json({exists: false});
    });
    */
});

module.exports = router;