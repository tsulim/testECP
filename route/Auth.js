const router = require('express').Router();

router.get("/signin",(req,res) => {
    res.render('auth/signin');
});

router.get("/signup",(req,res) => {
    res.render('auth/signup');
});

router.post("/signin",(req,res) => {
    res.render('home');
});

router.post("/signin",(req,res) => {
    res.render('home');
});


module.exports = router;