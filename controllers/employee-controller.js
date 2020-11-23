let Employee = require('../models/employee').Employee
let Department = require('../models/departments').Department
const { body, validationResult } = require('express-validator')
const passport = require('passport')

exports.employeeController = {
    create : async (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            req.flash('error', errors.array().map(e => e.msg + '</br>').join(''))
            res.redirect('/employees/register')
        } else {
            // START: Check if department id is not manipulated on front end.
            const department = await Department.findOne({_id : req.body.departmentId})
            if(department === undefined){
                req.flash('error', 'Department Id manipulated or matching department-id was not found.')
                res.redirect('/employees/register')
            }
            // END: Check if department id is not manipulated on front end.
            try{
                let employeeParams = getEmployeeParams(req.body)
                let newEmployee = new Employee(employeeParams)
                let employee = await Employee.register(newEmployee, req.body.password)
                req.flash('success', `${employee.fullName}'s account created successfully.`)
                res.redirect('/employees/login')
            } catch (err) {
                req.flash('error', `Failed to create account because ${err.message}.`)
                res.redirect('/employees/register')
            }
        }
    },
    authenticate: async (req, res, next) => {
        await passport.authenticate('local', function (err, employee, info){
            if(err)
                return next(err)
            if(!employee){
                req.flash('error', 'Failed to login')
                return res.redirect('back')                             // back - keyword to go back where we were
            }
            req.logIn(employee, function (err){
                if(err)
                    return next(err)
                req.flash('success', `${employee.fullName} logged in!`)
                return res.redirect('/')
            })
        })(req, res, next);
    },
    getSignup: async (req, res, next) => {
        try {
            const departments = await Department.find({})
            const AllDepartments = departments.map(department => {
                return {
                    objId: department._id,
                    name: department.name
                }
            })
            let options = {
                isCreate: true,
                tab_title: "ProfileHunt",
                title : 'Employee Signup',
                departmentList : AllDepartments,
                layout : 'layouts',
                styles : ['/assets/stylesheets/style.css']
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
    },
    logout: async (req, res, next) => {
        if(req.isAuthenticated()) {
            req.logout()
            if(req.isAuthenticated()) {
                req.flash('error', 'Unable to Log Out.')
                res.redirect('back')                    // back is keyword to go back to where we were
            } else {
                req.flash('success', 'Employee Logged Out Successfully.')
                res.redirect('/employees/login')
            }
        } else {
            req.flash('error', 'Please log in before trying to logout.')
            res.redirect('/employees/login')
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
        password: body.password,
        departmentId: body.departmentObjId
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
    body('departmentObjId')
        .notEmpty().withMessage('Department is required.'),
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