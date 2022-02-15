const router = require('express').Router();

// Get routes
router.get('/signin',(req,res) => {
    // renders in signin page
    res.render('auth/signin');
});

router.get('/signup',(req,res) => {
    res.render('home');
});

// Post routes
router.post('/signin', (req,res) => {
    console.log(req.query, req.body, req.params);
    // res.redirect('/auth/signin')
    res.render("auth/signin")
});

// Put routes

// Delete routes

module.exports = router;