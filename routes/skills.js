const express = require('express');
const router = express.Router();
let { skillsValidations, skillsController } = require('../controllers/skills-controller')

// Adding Skill - GET
router.get('/add', async function(req, res, next) {
    if(req.isAuthenticated()) {
        try{
            await skillsController.getAddSkill(req, res, next)
        }
        catch (err){
            next(err)
        }
    } else {
        req.flash('error', 'Please log in.')
        return res.redirect('/employees/login')
    }
})

// Adding-Editing Skill - POST
router.post('/save', skillsValidations, async (req, res, next) => {
    if(req.isAuthenticated()) {
        try{
            let skill
            if(req.body.saveMethod === 'create')
                await skillsController.create(req, res, next)
            else
                await skillsController.update(req, res, next)
        }
        catch (err){
            next(err)
        }
    } else {
        req.flash('error', 'Please log in.')
        return res.redirect('/employees/login')
    }
})

// Viewing Specific Skill
router.get('/view', async function(req, res, next) {
    if(req.isAuthenticated()) {
        try{
            await skillsController.view(req, res, next)
        }
        catch (err){
            next(err)
        }
    } else {
        req.flash('error', 'Please log in.')
        return res.redirect('/employees/login')
    }
})

// Editing Skill - GET
router.get('/edit', async function(req, res, next) {
    if(req.isAuthenticated()) {
        try{
            await skillsController.getEditSkill(req, res, next)
        }
        catch (err){
            next(err)
        }
    } else {
        req.flash('error', 'Please log in.')
        return res.redirect('/employees/login')
    }
})

// Deleting Skill
router.get('/destroy', async function(req, res, next) {
    if(req.isAuthenticated()) {
        try{
            await skillsController.destroy(req, res, next)
        }
        catch (err){
            next(err)
        }
    } else {
        req.flash('error', 'Please log in.')
        return res.redirect('/employees/login')
    }
})

// Viewing All Skill
router.get('/viewAll', async function(req, res, next) {
    if(req.isAuthenticated()) {
        try {
            await skillsController.getAllSkills(req, res, next)
        }
        catch (err) {
            next(err)
        }
    } else {
        req.flash('error', 'Please log in.')
        return res.redirect('/employees/login')
    }
})

// Searching employees with specific skill
router.post('/search', skillsValidations, async function(req, res, next) {
    if(req.isAuthenticated()) {
        try {
            await skillsController.skillSearch(req, res, next)
        }
        catch (err) {
            next(err)
        }
    } else {
        req.flash('error', 'Please log in.')
        return res.redirect('/employees/login')
    }
})

module.exports = router
