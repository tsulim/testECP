const router = require('express').Router();

router.get(['/','/home'],(req,res) => {
    res.render('home');
});

module.exports = router;