const { raw } = require('body-parser');
const Images = require('../models/Images');

const router = require('express').Router();

router.get(['/','/home'],(req,res) => {
    res.render('general/home');
});

router.get(['/gallery'],(req,res) => {
    Images.findAll({raw: true})
        .catch(err => console.log(err))
        .finally(images => {
            res.render('general/gallery', {
                cloudfront: process.env.CLOUDFRONT,
                images: images
            });
        })
});

// yong yudh: I was thinking of seperating bought artworks and new artworks
// into gallery and marketplace respectively
router.get(['/market'],(req,res) => {

});

module.exports = router;