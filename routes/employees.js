const express = require('express')
const router = express.Router()
let { employeeRegistrationValidations, employeeLoginValidations, employeeController } = require('../controllers/employee-controller')

router.get('/register', async (req, res, next)=>{
    await employeeController.getSignup(req, res, next)
})

router.post('/register', employeeRegistrationValidations, async (req, res, next) => {
    await employeeController.create(req, res, next)
})

router.post('/login', employeeLoginValidations, async (req, res, next) => {
    await employeeController.authenticate(req, res, next)
})

router.get('/login', async (req, res, next) => {
    await employeeController.getLogin(req, res, next)
})

router.get('/logout', async (req, res, next) => {
    await employeeController.logout(req, res, next)
})

router.get('/view', async (req, res, next) => {
    if(req.isAuthenticated()) {
        await employeeController.view(req, res, next)
    } else {
        req.flash('error', 'Please log in.')
        res.redirect('/employees/login')
    }
})

router.get('/destroy', async (req, res, next) => {
    if(req.isAuthenticated()) {
        await employeeController.destroy(req, res, next)
    } else {
        req.flash('error', 'Please log in.')
        res.redirect('/employees/login')
    }
})

module.exports = router