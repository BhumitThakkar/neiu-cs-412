const express = require('express');
const router = express.Router();
let departmentsStore = require('../app').departmentsStore

// Adding Department - GET
router.get('/add', async function(req, res, next) {
    try{
        let options = {
            isCreate: true,
            title : 'Add Department',
            departmentKey : await departmentsStore.count(),
            layout : 'layouts',
            styles : ['/stylesheets/style.css']
        }
        res.render('add_department', options)
    }
    catch (err){
        next(err)
    }
})

// Adding-Editing Department - POST
router.post('/save', async (req, res, next) => {
    try{
        let department
        if(req.body.saveMethod === 'create')
            department = await departmentsStore.create(req.body.departmentKey, req.body.departmentName, req.body.departmentHead)
        else
            department = await departmentsStore.update(req.body.departmentKey, req.body.departmentName, req.body.departmentHead)
        res.redirect('/departments/view?key='+req.body.departmentKey)
    }
    catch (err){
        next(err)
    }
})

// Viewing Specific Department
router.get('/view', async function(req, res, next) {
    try{
        let department = await departmentsStore.read(req.query.key)
        let options = {
            title : 'View Department',
            departmentKey : department.key,
            departmentName : department.name,
            departmentHead : department.head,
            layout : 'layouts',
            styles : ['/stylesheets/style.css']
        }
        res.render('view_department', options)
    }
    catch (err){
        next(err)
    }
})

// Editing Department - GET
router.get('/edit', async function(req, res, next) {
    try{
        let department = await departmentsStore.read(req.query.key)
        let options = {
            isCreate: false,
            title : 'Edit Department',
            departmentKey : department.key,
            departmentName : department.name,
            departmentHead : department.head,
            layout : 'layouts',
            styles : ['/stylesheets/style.css']
        }
        res.render('edit_department', options)
    }
    catch (err){
        next(err)
    }
})

// Deleting Department
router.get('/destroy', async function(req, res, next) {
    try{
        let department = await departmentsStore.destroy(req.query.key)
        res.redirect('/departments/viewAll')
    }
    catch (err){
        next(err)
    }
})

// Viewing All Department
router.get('/viewAll', async function(req, res, next) {
    try {
        let keyList = await departmentsStore.keyList()
        let keyPromises = keyList.map(key => {
            return departmentsStore.read(key)
        })
        let allDepartments = await Promise.all(keyPromises)
        let options = {
            title : 'All Departments',
            departmentList : extractDepartmentsToLiteral(allDepartments),
            layout : 'layouts',
            styles : ['/stylesheets/style.css']
        }
        res.render('view_all_departments', options);
    }
    catch (err) {
        next(err)
    }
})

function extractDepartmentsToLiteral(allDepartments){
    return allDepartments.map(department => {
        return {
            key: department.key,
            name: department.name,
            head: department.head,
        }
    })
}

module.exports = router
