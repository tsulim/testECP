const router = require('express').Router();

router.get(['/','/home'],(req,res) => {
    res.render('general/home');
});

module.exports = router;