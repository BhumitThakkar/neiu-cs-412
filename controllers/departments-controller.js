let Employee = require('../models/employee').Employee
let Department = require('../models/departments').Department
const { body, validationResult } = require('express-validator')

exports.departmentsController = {
    create : async (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            req.flash('error', errors.array().map(e => e.msg + '</br>').join(''))
            return res.redirect('/departments/add')
        } else {
            try{
                let departmentParams = getDepartmentParams(req.body)
                let department = await Department.findOne({ name : req.body.departmentName})
                if(department !== null){
                    req.flash('error', 'Department already exist.')
                    return res.redirect('back')
                } else {
                    let department = await Department.create(departmentParams)
                    req.flash('success', `${department.name} department is created successfully.`)
                    return res.redirect('/departments/view?objId='+department.id)
                }
            } catch (err) {
                console.log(`Error saving department: ${err.message}`)
                req.flash('error', `Failed to create department because ${err.message}.`)
                return res.redirect('/departments/add')
            }
        }
    },
    update : async (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            req.flash('error', errors.array().map(e => e.msg + '</br>').join(''))
            return res.redirect('/departments/viewAll')
        } else {
            try{
                let departmentParams = getDepartmentParams(req.body)
                let department = await Department.findOne({ _id : req.body.objId.trim()})
                if((department.name === "HR" && req.body.departmentName !== "HR") || (department.name === "Executive Board" && req.body.departmentName !== "Executive Board")) {
                    req.flash('error', 'HR and Executive Board department-name can never be edited.')
                    return res.redirect('back')
                } else {
                    let department = await Department.findOne({ name : req.body.departmentName})
                    if(department !== null && (department.name !== "HR" && department.name !== "Executive Board")){
                        req.flash('error', 'Department already exist.')
                        return res.redirect('back')
                    } else {
                        let department = await Department.findOneAndUpdate({_id: req.body.objId.trim()}, departmentParams)
                        req.flash('success', `${department.name} department is updated successfully.`)
                        return res.redirect('/departments/view?objId=' + department.id)
                    }
                }
            } catch (err) {
                console.log(`Error updating department: ${err.message}`)
                req.flash('error', `Failed to update department because ${err.message}.`)
                return res.redirect('/departments/viewAll')
            }
        }
    },
    view : async (req, res, next) => {
        try{
            const department = await Department.findOne({_id : req.query.objId.trim()})
            let employeeIds = department.employees
            let employeePromises = employeeIds.map(id => Employee.findOne({_id: id}))
            let employees = await Promise.all(employeePromises)
            const allEmployees = employees.map(employee => {
                return {
                    employeeId: employee.id,
                    name: employee.fullName
                }
            })
            let options = {
                tab_title: "ProfileHunt",
                title : 'View Department',
                objId : department.id,
                departmentName : department.name,
                departmentHead : department.head,
                employeeList : allEmployees,
                layout : 'layouts',
                styles : ['/assets/stylesheets/style.css']
            }
            return res.render('departments/view_department', options)
        } catch (err) {
            console.log(`Something went wrong while fetching department: ${err.message}`)
            req.flash('error', `Something went wrong while fetching department because ${err.message}.`)
            return res.redirect('/departments/viewAll')
        }
    },
    getEditDepartment : async (req, res, next) => {
        try{
            const department = await Department.findOne({_id : req.query.objId.trim()})
            let options = {
                isCreate: false,
                tab_title: "ProfileHunt",
                title : 'Edit Department',
                objId: department.id,
                departmentName : department.name,
                departmentHead : department.head,
                layout : 'layouts',
                styles : ['/assets/stylesheets/style.css']
            }
            return res.render('departments/edit_department', options)
        } catch (err) {
            console.log(`Something went wrong while fetching department: ${err.message}`)
            req.flash('error', `Something went wrong while fetching department because ${err.message}.`)
            return res.redirect('/departments/viewAll')
        }
    },
    destroy : async (req, res, next) => {
        try{
            let department =await Department.findById({_id : req.query.objId.trim()})
            if (department.employees.length > 0) {
                req.flash('error', 'Department cannot be deleted with employees in it.')
                return res.redirect('back')                    // back - keyword to go back to where we were
            } else {
                const deletedDepartment = await Department.deleteOne({_id : req.query.objId.trim()})           // department is not returned actually
                req.flash('success', `Department deleted successfully.`)
                return res.redirect('/departments/viewAll')
            }
        } catch (err) {
            console.log(`Something went wrong while deleting: ${err.message}`)
            req.flash('error', `Something went wrong while deleting because ${err.message}.`)
            return res.redirect('/departments/viewAll')
        }
    },
    getAllDepartments : async (req, res, next) => {
        const departments = await Department.find({})
        const AllDepartments = departments.map(department => {
            return {
                objId: department.id,
                name: department.name
            }
        })
        let options = {
            tab_title: "ProfileHunt",
            title : 'All Departments',
            departmentList : AllDepartments,
            layout : 'layouts',
            styles : ['/assets/stylesheets/style.css'],
            isAllDepartmentActive: 'active'
        }
        return res.render('departments/view_all_departments', options);
    },
    getAddDepartment : async (req, res, next) => {
        let options = {
            isCreate: true,
            tab_title: "ProfileHunt",
            title : 'Add Department',
            layout : 'layouts',
            styles : ['/assets/stylesheets/style.css'],
            isAddDepartmentActive: 'active'
        }
        return res.render('departments/add_department', options)
    }
}

const getDepartmentParams = body => {
    return {
        name : body.departmentName,
        head : body.departmentHead
    }
}

exports.departmentValidations = [
    body('departmentName')
        .notEmpty().withMessage('Department Name is required.')
        .isLength({min: 2}).withMessage('Department Name must be at least 2 characters.'),
    body('departmentHead')
        .notEmpty().withMessage('Department Head is required.')
        .isLength({min: 2}).withMessage('Department Head must be at least 2 characters.')
]