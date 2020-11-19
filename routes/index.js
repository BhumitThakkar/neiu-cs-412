const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
    if(req.isAuthenticated()) {
        let options = {
            tab_title: "ProfileHunt",
            title : 'Home',
            appName : 'ProfileHunt',
            layout : 'layouts',
            styles : ['/assets/stylesheets/style.css'],
            isHomeActive: "active"
        }
        res.render('index', options);
    } else {
        req.flash('error', 'Please log in.')
        res.redirect('/employees/login')
    }
})

module.exports = router;
