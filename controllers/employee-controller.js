let Employee = require('../models/employee').Employee
const { body, validationResult } = require('express-validator')

exports.employeeController = {
    create : async (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            req.flash('error', errors.array().map(e => e.msg + '</br>').join(''))
            res.redirect('/employees/register')
        } else {
            try{
                let employeeParams = getEmployeeParams(req.body)
                let employee = await Employee.create(employeeParams)
                req.flash('success', `${employee.fullName}'s account created successfully.`)
                res.redirect('/')
            } catch (err) {
                console.log(`Error saving employee: ${err.message}`)
                req.flash('error', `Failed to create account because ${err.message}.`)
                res.redirect('/employees/register')
            }
        }
    },
    authenticate: async (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            req.flash('error', errors.array().map(e => e.msg + '</br>').join(''))
            res.redirect('/employees/login')
        } else {
            try {
                let employee = await Employee.findOne({email: req.body.email})
                if (employee && await employee.passwordComparison(req.body.password)) {
                    req.flash('success', `${employee.fullName} logged in successfully.`)
                    res.redirect('/')
                } else {
                    req.flash('error', 'Your email or password is incorrect. Please try again or contact your system administrator.')
                    res.redirect('/employees/login')
                }
            } catch (err) {
                console.log(`Error authenticating employee: ${err.message}`)
                req.flash('error', 'Your email or password is incorrect. Please try again or contact your system administrator.')
                res.redirect('/employees/login')
            }
        }
    },
    getSignup: async (req, res, next) => {
        try {
            let options = {
                isCreate: true,
                tab_title: "ProfileHunt",
                title : 'Employee Signup',
                layout : 'layouts',
                styles : ['/assets/stylesheets/style.css'],
            }
            res.render('employees/register', options)
        } catch (err) {
            req.flash('error', `Error Getting Signup Page because ${err.msg}`)
            res.redirect('/')
        }
    },
    getLogin: async (req, res, next) => {
        try {
            let options = {
                isCreate: true,
                tab_title: "ProfileHunt",
                title : 'Employee Login',
                layout : 'layouts',
                styles : ['/assets/stylesheets/style.css'],
            }
            res.render('employees/login', options)
        } catch (err) {
            req.flash('error', `Error Getting Login Page because ${err.msg}`)
            res.redirect('/')
        }
    }
}

const getEmployeeParams = body => {
    return {
        name: {
            first: body.first,
            last: body.last
        },
        phNumber: body.phNumber,
        jobTitle: body.jobTitle,
        jobRole: body.jobRole,
        email: body.email,
        password: body.password
    }
}

exports.employeeRegistrationValidations = [
    body('first')
        .notEmpty().withMessage('First Name is required.')
        .isLength({min: 2}).withMessage('First name must be at least 2 characters.'),
    body('last')
        .notEmpty().withMessage('Last Name is required.')
        .isLength({min: 2}).withMessage('Last name must be at least 2 characters.'),
    body('password')
        .notEmpty().withMessage('Password is required.')
        .isLength({min: 8}).withMessage('Password must be at least 8 characters.'),
    body('phNumber')
        .notEmpty().withMessage('Personal Phone Number is required.')
        .isNumeric().withMessage('Personal Phone Number must be numeric.')
        .isLength({min: 10, max: 10}).withMessage('Personal Phone Number must be 10 characters only.'),
    body('jobTitle')
        .notEmpty().withMessage('Job Title is required.')
        .isLength({min: 2}).withMessage('Job Title must be at least 2 characters.'),
    body('jobRole')
        .notEmpty().withMessage('Job Role is required.')
        .isLength({min: 5}).withMessage('Job Role must be at least 5 characters.'),
    body('email')
        .notEmpty().withMessage('Email is required.')
        .isEmail().normalizeEmail().withMessage('Email is invalid.')
]

exports.employeeLoginValidations = [
    body('password')
        .notEmpty().withMessage('Password is required.')
        .isLength({min: 8}).withMessage('Password must be at least 8 characters.'),
    body('email')
        .notEmpty().withMessage('Email is required.')
        .isEmail().normalizeEmail().withMessage('Email is invalid.')
]