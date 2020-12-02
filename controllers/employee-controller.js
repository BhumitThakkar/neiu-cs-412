let Employee = require('../models/employee').Employee
let Department = require('../models/departments').Department
let Skill = require('../models/skills').Skill
const { body, validationResult } = require('express-validator')
const passport = require('passport')
let encryptDecrypt = require('../appsupport').encryptDecrypt

exports.employeeController = {
    create : async (req, res, next) => {
        const errors = validationResult(req)
        let department
        if(!errors.isEmpty()){
            req.flash('error', errors.array().map(e => e.msg + '</br>').join(''))
            return res.redirect('/employees/register')
        } else {
            try {
                // check email & phNumber uniqueNess - start
                let existEmailEmployee = await Employee.findOne({ email : req.body.email})
                let edcrypt = await encryptDecrypt()
                let UpdatedEncryptedPhNumber = await edcrypt.encrypt(req.body.phNumber)
                let existPhNumberEmployee = await Employee.findOne({ phNumber : UpdatedEncryptedPhNumber})
                if(existEmailEmployee !== null) {
                    req.flash('error', 'Employee with given email already exist.')
                    return res.redirect('back')
                } else if (existPhNumberEmployee !== null) {
                    req.flash('error', 'Employee with given Phone Number already exist.')
                    return res.redirect('back')
                }
                // check email & phNumber uniqueNess - end

               if(res.locals.showAddHR){                // there won't be any department added if any employee is not yet added
                    department = await Department.create({ name : "HR", head : req.body.first+" "+req.body.last})
                } else if(res.locals.showAddCEO){                // Executive Board Department to be added as soon as HR is added and CEO is being added
                    department = await Department.create({ name : "Executive Board", head : req.body.first+" "+req.body.last})
                } else {
                    // START: Check if department id is not manipulated on front end.
                    department = await Department.findOne({_id: req.body.departmentId})
                    if (department === null) {
                        req.flash('error', 'Department Id manipulated or matching department-id was not found.')
                        return res.redirect('/employees/register')
                    }
                    // END: Check if department id is not manipulated on front end.
                }

                if(res.locals.showAddHR || res.locals.showAddCEO){                                       // if no employee in databse
                    let employeeParams = getEmployeeParams(req.body, "self")                    // it will be updated to self further
                    employeeParams.departmentId = department.id
                    if(res.locals.showAddCEO)
                        employeeParams.jobTitle = "CEO"
                    let newEmployee = new Employee(employeeParams)
                    let employee = await Employee.register(newEmployee, req.body.password)
                    newEmployee.managerId = employee.id
                    employee = await Employee.findByIdAndUpdate({_id:employee.id}, newEmployee, {new:true})
                    department.employees.push(employee.id)
                    department = await Department.findByIdAndUpdate({_id: department.id}, {employees: department.employees}, {new: true})             // new:true ensures updated department is returned
                    if(res.locals.showAddCEO){                                                                                                                         // to update manager of HR as soon as CEO is added
                        let HREmployee = await Employee.findOneAndUpdate({departmentId : res.locals.HRDepartmentId}, {managerId : employee.id}, {new: true})        // updating HR's managerId
                    }
                    req.flash('success', `${employee.fullName}'s account created successfully.`)
                if(res.locals.showAddHR)
                    return res.redirect('/employees/login')
                if(res.locals.showAddCEO)
                    return res.redirect('back')                                // this should go back to add employee
                } else {                                                // if adding 3rd or more employee
                    let employeeParams = {
                        phNumber : req.body.managerPhNumber
                    }
                    employeeParams = await req.user.encryptEmployeeParams(employeeParams)
                    let manager = await Employee.findOne({phNumber: employeeParams.phNumber})
                    if(manager === null){                               // if manager not found
                        req.flash('error', `Employee Phone Number does not match with any Employee.`)
                        return res.redirect('back')
                    } else {                                            // if manager found
                        let managerId = manager.id
                        employeeParams = getEmployeeParams(req.body, managerId)
                        let newEmployee = new Employee(employeeParams)
                        let employee = await Employee.register(newEmployee, req.body.password)
                        department.employees.push(employee.id)
                        department = await Department.findByIdAndUpdate({_id: department.id}, {employees: department.employees}, {new: true})             // new:true ensures updated department is returned
                        req.flash('success', `${employee.fullName}'s account created successfully.`)
                        return res.redirect('back')                            // this should go back to add employee
                    }
                }
            } catch (err) {
                req.flash('error', `Failed to create account because ${err.message}.`)
                return res.redirect('/employees/register')
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
            employee = await employee.decryptEmployee()
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
            let department = await Department.findOne({_id: employee.departmentId})
            let manager = await Employee.findOne({_id: employee.managerId})
            let options = {
                employee: employee,
                tab_title: "ProfileHunt",
                appName :"ProfileHunt",
                departmentName : department.name,
                managerName : manager.fullName,
                skillList: allSkills,
                layout : 'layouts',
                styles : ['/assets/stylesheets/style.css']
            }
            if(req.originalUrl === "/"){
                options.showWelcome = true
                options.title = "Home"
            } else {
                options.showWelcome = false
                options.title = "View Profile"
            }
            return res.render('employees/view_employee', options)
        } catch (err) {
            console.log(`Something went wrong while fetching employee: ${err.message}`)
            req.flash('error', `Something went wrong while fetching employee because ${err.message}.`)
            return res.render('error', {layout : 'layouts', styles : ['/assets/stylesheets/style.css'], tab_title: "ProfileHunt", title: "Oops! Error"})
        }
    },
    destroy : async (req, res, next) => {
        try{
            let employeesInHR = await Employee.countDocuments({departmentId : res.locals.HRDepartmentId})
            let employee = await Employee.findOne({_id : req.query.objId.trim()})
            if(employee.departmentId === res.locals.HRDepartmentId && employeesInHR === 1){                    // only 1 HR left which is deleting so whole system goes down
                await Employee.deleteMany()
                await Department.deleteMany()
                await Skill.deleteMany()
                req.flash('success', 'Whole System deleted successfully because no HR Employee was left inside system.')
                return res.redirect("/")
            } else {
                let employeesInCompany = await Employee.find({})
                for(let i = 0; i < employeesInCompany.length; i++){
                    if(employee.id === employeesInCompany[i].managerId){
                        req.flash("error", "You can't delete employee who is manager of someone. You can edit though.")
                        return res.redirect('back')
                    }
                }

                let redirectTo = '/employees/login'
                if(req.user.id !== req.query.objId.trim()){
                    redirectTo = 'back'
                }
                for(let i = 0; i < employee.skills.length; i++){
                    let employeeSkill = await Skill.findOne({_id: employee.skills[i]})
                    let deleteEmployeeIndex = employeeSkill.employees.indexOf(employee.id)
                    employeeSkill.employees.splice(deleteEmployeeIndex, 1)
                    if(employeeSkill.employees.length > 0)                                    // Skill is attached to at least 1 other employee
                        await employeeSkill.findByIdAndUpdate({_id:employeeSkill.id}, {employees : employeeSkill.employees})
                    else                                                                      // Skill is now not attached to any employee
                        await employeeSkill.deleteOne({_id:employeeSkill.id})
                }
                let department = await Department.findOne({_id : employee.departmentId})
                let deleteEmployeeIndex = department.employees.indexOf(employee.id)
                department.employees.splice(deleteEmployeeIndex, 1)
                const updatedDepartment = await Department.findByIdAndUpdate({_id : department.id}, {employees : department.employees})
                const deletedEmployee = await Employee.deleteOne({_id : req.query.objId.trim()})           // employee is not returned actually
                req.flash('success', 'Employee deleted successfully.')
                return res.redirect(redirectTo)
            }
        } catch (err) {
            console.log(`Something went wrong while deleting: ${err.message}`)
            req.flash('error', `Something went wrong while deleting because ${err.message}.`)
            return res.redirect('back')
        }
    },
    getEdit: async (req, res, next) => {
        try {
            let id
            if(req.user.departmentId === res.locals.HRDepartmentId && req.query.objId !== undefined)               // HR employee only can access other employee edit
                id = req.query.objId.trim()
            else                                                                                                // other can access edit but only own
                id = req.user.id
            let employee = await Employee.findOne({_id : id })
            employee = await employee.decryptEmployee()
            employee = getEmployeeFromEmployeeObject(employee)
            const department = await Department.findOne({_id : employee.departmentId})
            const departments = await Department.find({})
            const AllDepartments = departments.filter(d => d.id !== department.id).map(d => {
                return {
                    objId: d.id,
                    name: d.name
                }
            })
            let manager = await Employee.findOne({_id: employee.managerId})
            manager = await manager.decryptEmployee()
            console.log(manager)
            let options = {
                isCreate : false,
                tab_title : "ProfileHunt",
                title : 'Edit Employee',
                employee : employee,
                managerPhNumber : manager.phNumber,
                departmentId : department.id,
                departmentName: department.name,
                departmentList: AllDepartments,
                layout : 'layouts',
                styles : ['/assets/stylesheets/style.css']
            }
            if(employee.jobTitle === "CEO"){
                options.isNotCEO = false
            } else {
                options.isNotCEO = true
            }
            return res.render('employees/edit_employee', options)
        } catch (err) {
            req.flash('error', `Error Getting Edit-Employee Page because ${err.msg}`)
            return res.redirect('/')
        }
    },
    edit:async (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            req.flash('error', errors.array().map(e => e.msg + '</br>').join(''))
            return res.redirect('back')
        } else {
            try{
                let employeeParams = getEditEmployeeParams(req.body)
                let employee = await Employee.findOne({ _id : req.user.id})
                let existEmailEmployee = await Employee.findOne({ email : req.body.email})
                let edcrypt = await encryptDecrypt()
                let UpdatedEncryptedPhNumber = await edcrypt.encrypt(req.body.phNumber)
                let existPhNumberEmployee = await Employee.findOne({ phNumber : UpdatedEncryptedPhNumber})
                if(existEmailEmployee !== null && req.user.email !== req.body.email) {
                    req.flash('error', 'Employee with given email already exist.')
                    return res.redirect('back')
                } else if(existPhNumberEmployee !== null && req.user.phNumber !== req.body.phNumber){
                    req.flash('error', 'Employee with given Phone Number already exist.')
                    return res.redirect('back')
                } else {
                    employeeParams = await employee.encryptEmployeeParams(employeeParams)
                    employee = await Employee.findOneAndUpdate({_id: req.user.id}, employeeParams)
                    req.flash('success', `${employee.fullName} employee is updated successfully.`)
                    return res.redirect('/employees/view')
                }
            } catch (err) {
                console.log(`Error updating employee: ${err.message}`)
                req.flash('error', `Failed to update employee because ${err.message}.`)
                return res.redirect('back')
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
                departmentList : AllDepartments,
                layout : 'layouts',
                styles : ['/assets/stylesheets/style.css']
            }
            if(res.locals.showAddHR)
                options.title = 'HR Head Signup'
            else if(res.locals.showAddCEO)
                options.title = 'CEO Signup'
            else
                options.title = 'Employee Signup'
            return res.render('employees/register', options)
        } catch (err) {
            req.flash('error', `Error Getting Signup Page because ${err.msg}`)
            return res.redirect('/')
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
            return res.render('employees/login', options)
        } catch (err) {
            req.flash('error', `Error Getting Login Page because ${err.msg}`)
            return res.redirect('/')
        }
    },
    logout: async (req, res, next) => {
        if(req.isAuthenticated()) {
            req.logout()
            if(req.isAuthenticated()) {
                req.flash('error', 'Unable to Log Out.')
                return res.redirect('back')                    // back is keyword to go back to where we were
            } else {
                req.flash('success', 'Employee Logged Out Successfully.')
                return res.redirect('/employees/login')
            }
        } else {
            req.flash('error', 'Please log in before trying to logout.')
            return res.redirect('/employees/login')
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

const getEmployeeParams = (body, managerId) => {
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
        departmentId: body.departmentId,
        managerId: managerId
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
        managerId: employee.managerId,
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
    body('managerPhNumber')
        .notEmpty().withMessage('Manager phNumber is required.')
        .isNumeric().withMessage('Manager Phone Number must be numeric.')
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
exports.employeeEditByHRValidations = [
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
    body('departmentId')
        .notEmpty().withMessage('Department is required.'),
    body('managerPhNumber')
        .notEmpty().withMessage('Manager phNumber is required.')
        .isNumeric().withMessage('Manager Phone Number must be numeric.')
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

exports.CEOEditByHRValidations = [
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