const express = require('express');
const router = express.Router();
let { employeeController } = require('../controllers/employee-controller')

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
    }
    else{
        await employeeController.getSignup(req, res, next)
    }
})

module.exports = router;
