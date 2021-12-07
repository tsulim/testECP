const router = require('express').Router();

router.get(['/','/home'],(req,res) => {
    res.render('general/home');
});

router.get(['/create'],(req,res) => {
    res.render('general/createnft');
});

router.post(['/createNFT'], (req, res) => {
    res.render('general/createCollab');
});

module.exports = router;