let Skill = require('../models/skills').Skill
let Employee = require('../models/employee').Employee
const { body, validationResult } = require('express-validator')

exports.skillsController = {
    create : async (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            req.flash('error', errors.array().map(e => e.msg + '</br>').join(''))
            res.redirect('/skills/add')
        } else {
            try{
                let skillIds = req.user.skills
                let skillPromises = skillIds.map(id => Skill.findOne({_id: id}))
                let skills = await Promise.all(skillPromises)
                const employeeSkillNames = skills.map(skill => {
                    return skill.name
                })
                let skillParams = getSkillParams(req.body)
                if(employeeSkillNames.indexOf(skillParams.name) !== -1){
                    req.flash('error', 'Skill already exist.')
                    res.redirect('back')
                } else {
                    let skill = await Skill.create(skillParams)
                    req.user.skills.push(skill._id)
                    req.user = await Employee.findByIdAndUpdate({_id:req.user._id}, {skills: req.user.skills}, {new: true})             // new:true ensures updated employee is returned
                    req.flash('success', `${skill.name} skill is created successfully.`)
                    res.redirect('/skills/viewAll')
                }
            } catch (err) {
                console.log(`Error saving skill: ${err.message}`)
                req.flash('error', `Failed to create skill because ${err.message}.`)
                res.redirect('/skills/add')
            }
        }
    },
    update : async (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            req.flash('error', errors.array().map(e => e.msg + '</br>').join(''))
            res.redirect('/skills/viewAll')
        } else {
            try {
                let skillIds = req.user.skills
                let skillPromises = skillIds.map(id => Skill.findOne({_id: id}))
                let skills = await Promise.all(skillPromises)
                const employeeSkillNames = skills.map(skill => {
                    return skill.name
                })
                let skillParams = getSkillParams(req.body)
                if (employeeSkillNames.indexOf(skillParams.name) !== -1) {
                    req.flash('error', 'Skill already exist.')
                    res.redirect('back')
                } else {
                    let skill = await Skill.findOneAndUpdate({_id: req.body.objId.trim()}, skillParams)
                    req.flash('success', `${skill.name} skill is updated successfully.`)
                    res.redirect('/skills/viewAll')
                }
            }catch (err) {
                console.log(`Error updating skill: ${err.message}`)
                req.flash('error', `Failed to update skill because ${err.message}.`)
                res.redirect('/skills/viewAll')
            }
        }
    },
    getEditSkill : async (req, res, next) => {
        try{
            const skill = await Skill.findOne({_id : req.query.objId.trim()})
            let options = {
                isCreate: false,
                tab_title: "ProfileHunt",
                title : 'Edit Skill',
                objId: skill._id,
                skillName : skill.name,
                layout : 'layouts',
                styles : ['/assets/stylesheets/style.css']
            }
            res.render('skills/edit_skill', options)
        } catch (err) {
            console.log(`Something went wrong while fetching skill: ${err.message}`)
            req.flash('error', `Something went wrong while fetching skill because ${err.message}.`)
            res.redirect('/skills/viewAll')
        }
    },
    destroy : async (req, res, next) => {
        try{
            const skill = await Skill.deleteOne({_id : req.query.objId.trim()})           // skill is not returned actually
            const skillIndex = req.user.skills.indexOf(req.query.objId.trim())
            req.user.skills.splice(skillIndex, 1);
            req.user = await Employee.findByIdAndUpdate({_id:req.user._id}, {skills: req.user.skills}, {new: true})             // new:true ensures updated employee is returned
            req.flash('success', 'Skill deleted successfully.')
            res.redirect('/skills/viewAll')
        } catch (err) {
            console.log(`Something went wrong while deleting: ${err.message}`)
            req.flash('error', `Something went wrong while deleting because ${err.message}.`)
            res.redirect('/skills/viewAll')
        }
    },
    getAllSkills : async (req, res, next) => {
        let skillIds = req.user.skills
        let skillPromises = skillIds.map(id => Skill.findOne({_id: id}))
        let skills = await Promise.all(skillPromises)
        const AllSkills = skills.map(skill => {
            return {
                objId: skill._id,
                name: skill.name
            }
        })
        let options = {
            tab_title: "ProfileHunt",
            title : 'All Skills',
            skillList : AllSkills,
            layout : 'layouts',
            styles : ['/assets/stylesheets/style.css'],
            isAllSkillActive: 'active'
        }
        res.render('skills/view_all_skills', options);
    },
    getAddSkill : async (req, res, next) => {
        let options = {
            isCreate: true,
            tab_title: "ProfileHunt",
            title : 'Add Skill',
            layout : 'layouts',
            styles : ['/assets/stylesheets/style.css'],
            isAddSkillActive: 'active'
        }
        res.render('skills/add_skill', options)
    }
}

const getSkillParams = body => {
    return {
        name : body.skillName
    }
}

exports.skillsValidations = [
    body('skillName')
        .notEmpty().withMessage('Skill Name is required.')
        .isLength({min: 2}).withMessage('Skill Name must be at least 2 characters.'),
]