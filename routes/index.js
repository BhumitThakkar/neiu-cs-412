const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
    let options = {
        title : 'ProfileHunt',
        appName : 'ProfileHunt',
        layout : 'layouts',
        styles : ['/stylesheets/style.css']
    }
    res.render('index', options);
});

module.exports = router;
