let Employee = require('../models/employee').Employee
let Department = require('../models/departments').Department
let Skill = require('../models/skills').Skill
const { body, validationResult } = require('express-validator')
const passport = require('passport')

exports.employeeController = {
    create : async (req, res, next) => {
        const errors = validationResult(req)
        let department
        if(!errors.isEmpty()){
            req.flash('error', errors.array().map(e => e.msg + '</br>').join(''))
            res.redirect('/employees/register')
        } else {
            try {
                // START: Check if department id is not manipulated on front end.
                department = await Department.findOne({_id: req.body.departmentId})
                if (department === null) {
                    req.flash('error', 'Department Id manipulated or matching department-id was not found.')
                    res.redirect('/employees/register')
                }
                // END: Check if department id is not manipulated on front end.
                else {
                    let employeeParams = getEmployeeParams(req.body)
                    let newEmployee = new Employee(employeeParams)
                    let employee = await Employee.register(newEmployee, req.body.password)
                    department.employees.push(employee.id)
                    department = await Department.findByIdAndUpdate({_id: department.id}, {employees: department.employees}, {new: true})             // new:true ensures updated department is returned
                    req.flash('success', `${employee.fullName}'s account created successfully.`)
                    res.redirect('/employees/login')
                }
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
    view : async (req, res, next) => {
        try{
            let employee
            let id
            if(req.query.objId !== undefined)
                id = req.query.objId.trim()
            else
                id = req.user.id
            employee = await Employee.findOne({_id : id })
            // employee = await employee.decryptEmployee(employee)
            employee = getEmployeeFromEmployeeObject(employee)
            let skillIds = employee.skills
            let skillPromises = skillIds.map(id => Skill.findOne({_id: id}))
            let skills = await Promise.all(skillPromises)
            const allSkills = skills.map(skill => {
                return {
                    skillId: skill.id,
                    name: skill.name
                }
            })
            let department = await Department.findOne({_id: req.user.departmentId})
            let options = {
                employee: employee,
                tab_title: "ProfileHunt",
                appName :"ProfileHunt",
                departmentName : department.name,
                skillList: allSkills,
                layout : 'layouts',
                styles : ['/assets/stylesheets/style.css']
            }
            if(req.originalUrl === "/"){
                options.showWelcome = true
                options.title = "Home"
            } else{
                options.showWelcome = false
                options.title = "View Profile"
            }
            res.render('employees/view_employee', options)
        } catch (err) {
            console.log(`Something went wrong while fetching employee: ${err.message}`)
            req.flash('error', `Something went wrong while fetching employee because ${err.message}.`)
            res.render('error')
        }
    },
    destroy : async (req, res, next) => {
        try{
            let redirectTo = '/employees/login'
            if(req.user.id !== req.query.objId.trim()){
                redirectTo = 'back'
            }
            let employee = await Employee.findOne({_id : req.query.objId.trim()})
            for(let i = 0; i < employee.skills.length; i++){
                let employeeSkill = await Skill.findOne({_id: employee.skills[i]})
                employeeSkill.employees.splice(employee.id, 1)
                if(employeeSkill.employees.length > 0)                                    // Skill is attached to at least 1 other employee
                    await employeeSkill.findByIdAndUpdate({_id:employeeSkill.id}, {employees : employeeSkill.employees})
                else                                                                      // Skill is now not attached to any employee
                    await employeeSkill.deleteOne({_id:employeeSkill.id})
            }
            let department = await Department.findOne({_id : employee.departmentId})
            let employeeIndex = department.employees.indexOf(employee.id)
            department.employees.splice(employeeIndex, 1)
            const updatedDepartment = await Department.findByIdAndUpdate({_id : department.id}, {employees : department.employees})
            const deletedEmployee = await Employee.deleteOne({_id : req.query.objId.trim()})           // employee is not returned actually
            req.flash('success', 'Employee deleted successfully.')
            res.redirect(redirectTo)
        } catch (err) {
            console.log(`Something went wrong while deleting: ${err.message}`)
            req.flash('error', `Something went wrong while deleting because ${err.message}.`)
            res.redirect('back')
        }
    },
    getEdit: async (req, res, next) => {
        try {
            let employee = await Employee.findOne({_id : req.user.id })
            employee = getEmployeeFromEmployeeObject(employee)
            let options = {
                isCreate : false,
                tab_title : "ProfileHunt",
                title : 'Edit Employee',
                employee : employee,
                layout : 'layouts',
                styles : ['/assets/stylesheets/style.css']
            }
            res.render('employees/edit_employee', options)
        } catch (err) {
            req.flash('error', `Error Getting Edit-Employee Page because ${err.msg}`)
            res.redirect('/')
        }
    },
    edit:async (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            req.flash('error', errors.array().map(e => e.msg + '</br>').join(''))
            res.redirect('back')
        } else {
            try{
                let employeeParams = getEditEmployeeParams(req.body)
                let employee = await Employee.findOne({ _id : req.user.id})
                let existEmailEmployee = await Employee.findOne({ email : req.body.email})
                let existPhNumberEmployee = await Employee.findOne({ phNumber : req.body.phNumber})
                if(existEmailEmployee !== null && req.user.email !== req.body.email) {
                    req.flash('error', 'Employee with given email already exist.')
                    res.redirect('back')
                } else if(existPhNumberEmployee !== null && req.user.phNumber !== req.body.phNumber){
                    req.flash('error', 'Employee with given phNumber already exist.')
                    res.redirect('back')
                } else {
                    employee = await Employee.findOneAndUpdate({_id: req.user.id}, employeeParams)
                    req.flash('success', `${employee.fullName} employee is updated successfully.`)
                    res.redirect('/employees/view')
                }
            } catch (err) {
                console.log(`Error updating employee: ${err.message}`)
                req.flash('error', `Failed to update employee because ${err.message}.`)
                res.redirect('back')
            }
        }
    },
    getSignup: async (req, res, next) => {
        try {
            const departments = await Department.find({})
            const AllDepartments = departments.map(department => {
                return {
                    objId: department.id,
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

function getEditEmployeeParams(body) {
    return {
        name: {
            first: body.first,
            last: body.last
        },
        phNumber: body.phNumber,
        email: body.email
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
        departmentId: body.departmentId
    }
}

const getEmployeeFromEmployeeObject = employee => {
    return {
        name : {
            first: employee.name.first,
            last: employee.name.last
        },
        phNumber: employee.phNumber,
        jobTitle: employee.jobTitle,
        jobRole: employee.jobRole.replace('\n','<br/>'),
        email: employee.email,
        skills: employee.skills,
        departmentId: employee.departmentId,
        id: employee.id
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
    body('departmentId')
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

exports.employeeEditValidations = [
    body('first')
        .notEmpty().withMessage('First Name is required.')
        .isLength({min: 2}).withMessage('First name must be at least 2 characters.'),
    body('last')
        .notEmpty().withMessage('Last Name is required.')
        .isLength({min: 2}).withMessage('Last name must be at least 2 characters.'),
    body('phNumber')
        .notEmpty().withMessage('Personal Phone Number is required.')
        .isNumeric().withMessage('Personal Phone Number must be numeric.')
        .isLength({min: 10, max: 10}).withMessage('Personal Phone Number must be 10 characters only.'),
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