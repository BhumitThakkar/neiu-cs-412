const express = require('express')
const router = express.Router()
let { employeeRegistrationValidations, employeeLoginValidations, employeeEditValidations, employeeEditByHRValidations, CEOEditByHRValidations, employeeController, changePasswordValidation} = require('../controllers/employee-controller')

router.get('/register', async (req, res, next)=>{
    if(res.locals.showAddHR || (req.isAuthenticated() && res.locals.canAddEmployee)) {
        await employeeController.getSignup(req, res, next)
    } else {
        req.flash('error', 'Permission Denied.')
        return res.redirect('back')
    }
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
    if(req.isAuthenticated()) {
        await employeeController.logout(req, res, next)
    } else {
        req.flash('error', 'Please log in.')
        return res.redirect('/employees/login')
    }
})

router.get('/view', async (req, res, next) => {
    if(req.isAuthenticated()) {
        await employeeController.view(req, res, next)
    } else {
        req.flash('error', 'Please log in.')
        return res.redirect('/employees/login')
    }
})

router.get('/destroy', async (req, res, next) => {
    if(req.isAuthenticated() && res.locals.canAddEmployee) {
        await employeeController.destroy(req, res, next)
    } else {
        req.flash('error', 'Permission Denied.')
        return res.redirect('back')
    }
})

router.get('/edit', async (req, res, next) => {
    if(req.isAuthenticated()) {
        await employeeController.getEdit(req, res, next)
    } else {
        req.flash('error', 'Please log in.')
        return res.redirect('/employees/login')
    }
})

router.post('/edit', employeeEditValidations, async (req, res, next) => {
    if(req.isAuthenticated()) {
        await employeeController.edit(req, res, next)
    } else {
        req.flash('error', 'Please log in.')
        return res.redirect('/employees/login')
    }
})

router.post('/editByHR', employeeEditByHRValidations, async (req, res, next) => {
    if(req.isAuthenticated()) {
        await employeeController.edit(req, res, next)
    } else {
        req.flash('error', 'Please log in.')
        return res.redirect('/employees/login')
    }
})

router.post('/CEOEditByHR', CEOEditByHRValidations, async (req, res, next) => {
    if(req.isAuthenticated()) {
        await employeeController.edit(req, res, next)
    } else {
        req.flash('error', 'Please log in.')
        return res.redirect('/employees/login')
    }
})

router.get('/changePassword',async (req, res, next) => {
    if(req.isAuthenticated()) {
        await employeeController.getChangePassword(req, res, next)
    } else {
        req.flash('error', 'Please log in.')
        return res.redirect('/employees/login')
    }
})

router.post('/changePassword', changePasswordValidation,async (req, res, next) => {
    if(req.isAuthenticated()) {
        await employeeController.changePassword(req, res, next)
    } else {
        req.flash('error', 'Please log in.')
        return res.redirect('/employees/login')
    }
})

module.exports = router