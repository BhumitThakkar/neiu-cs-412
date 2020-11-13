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

module.exports = router