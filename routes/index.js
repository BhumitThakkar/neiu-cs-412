const express = require('express');
const router = express.Router();
let { employeeController } = require('../controllers/employee-controller')

/* GET home page. */
router.get('/', async function(req, res, next) {
    if(req.isAuthenticated()) {
        await employeeController.view(req, res, next)
    }
    else{
        await employeeController.getLogin(req, res, next)
    }
})

module.exports = router;
