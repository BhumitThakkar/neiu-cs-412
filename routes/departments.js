const express = require('express');
const router = express.Router();
let { departmentValidations, departmentsController } = require('../controllers/departments-controller')

// Adding Department - GET
router.get('/add', async function(req, res, next) {
    try{
        let department = await departmentsController.getAddDepartment(req, res, next)
    }
    catch (err){
        next(err)
    }
})

// Adding-Editing Department - POST
router.post('/save', departmentValidations, async (req, res, next) => {
    try{
        let department
        if(req.body.saveMethod === 'create')
            department = await departmentsController.create(req, res, next)
        else
            department = await departmentsController.update(req, res, next)
    }
    catch (err){
        next(err)
    }
})

// Viewing Specific Department
router.get('/view', async function(req, res, next) {
    try{
        let department = await departmentsController.view(req, res, next)
    }
    catch (err){
        next(err)
    }
})

// Editing Department - GET
router.get('/edit', async function(req, res, next) {
    try{
        let department = await departmentsController.getEditDepartment(req, res, next)
    }
    catch (err){
        next(err)
    }
})

// Deleting Department
router.get('/destroy', async function(req, res, next) {
    try{
        let department = await departmentsController.destroy(req, res, next)
    }
    catch (err){
        next(err)
    }
})

// Viewing All Department
router.get('/viewAll', async function(req, res, next) {
    try {
        let AllDepartments = await departmentsController.getAllDepartments(req, res, next)
    }
    catch (err) {
        next(err)
    }
})

module.exports = router
