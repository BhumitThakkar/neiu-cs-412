let Skill = require('../models/skills').Skill
let Employee = require('../models/employee').Employee
const { body, validationResult } = require('express-validator')
let getPartialEmployeeFromEmployeeObject = require('../controllers/employee-controller').getPartialEmployeeFromEmployeeObject

exports.skillsController = {
    create : async (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            req.flash('error', errors.array().map(e => e.msg + '</br>').join(''))
            return res.redirect('/skills/add')
        } else {
            try{
                let skillParams = getSkillParams(req.body)
                let skillIds = req.user.skills
                let skillPromises = skillIds.map(id => Skill.findOne({_id: id}))
                let skills = await Promise.all(skillPromises)
                const employeeSkillNames = skills.map(skill => {
                    return skill.name
                })
                if(employeeSkillNames.indexOf(skillParams.name) !== -1){
                    req.flash('error', 'Skill already exist.')
                    return res.redirect('back')
                } else {
                    let skill = await Skill.findOne({name: skillParams.name})
                    if(skill === null){
                        skill = await Skill.create(skillParams)
                    }
                    req.user.skills.push(skill.id)
                    skill.employees.push(req.user.id)
                    req.user = await Employee.findByIdAndUpdate({_id:req.user.id}, {skills: req.user.skills}, {new: true})             // new:true ensures updated employee is returned
                    req.user = await Skill.findByIdAndUpdate({_id:skill.id}, {employees: skill.employees}, {new: true})             // new:true ensures updated employee is returned
                    req.flash('success', `${skill.name} skill is created successfully.`)
                    return res.redirect('/skills/viewAll')
                }
            } catch (err) {
                console.log(`Error saving skill: ${err.message}`)
                req.flash('error', `Failed to create skill because ${err.message}.`)
                return res.redirect('/skills/add')
            }
        }
    },
    update : async (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            req.flash('error', errors.array().map(e => e.msg + '</br>').join(''))
            return res.redirect('/skills/viewAll')
        } else {
            try {
                let skillParams = getSkillParams(req.body)
                let skillIds = req.user.skills
                let skillPromises = skillIds.map(id => Skill.findOne({_id: id}))
                let skills = await Promise.all(skillPromises)
                let oldSkill = await Skill.findOne({_id: req.body.objId.trim()})
                const employeeSkillNames = skills.map(skill => {
                    return skill.name
                })
                if (employeeSkillNames.indexOf(skillParams.name) !== -1) {
                    req.flash('error', 'Skill already exist.')
                    return res.redirect('back')
                } else {
                    let newSkill = await Skill.findOne({name: skillParams.name})
                    if(newSkill === null){
                        newSkill = await Skill.create(skillParams)
                    }
                    let deleteSkillIndex = req.user.skills.indexOf(oldSkill.id)
                    req.user.skills.splice(deleteSkillIndex, 1)                      // old skill removed from employee
                    req.user.skills.push(newSkill.id)
                    newSkill.employees.push(req.user.id)

                    if (oldSkill.employees.length > 1){                         // other employees has old skill
                        let deleteEmployeeIndex = req.user.skills.indexOf(req.user.id)
                        oldSkill.employees.splice(deleteEmployeeIndex, 1)               // employee removed from old skill
                        oldSkill = await Skill.findOneAndUpdate({_id: oldSkill.id}, {employees: oldSkill.employees}, {new: true})
                    } else {                                                    // only 1 employee in old skill
                        oldSkill = await Skill.deleteOne({_id: oldSkill.id})
                    }
                    newSkill = await Skill.findByIdAndUpdate({_id: newSkill.id}, {employees: newSkill.employees}, {new: true})             // new:true ensures updated skill is returned
                    req.user = await Employee.findByIdAndUpdate({_id: req.user.id}, {skills: req.user.skills}, {new: true})             // new:true ensures updated employee is returned
                    req.flash('success', `${newSkill.name} skill is updated successfully.`)
                    return res.redirect('/skills/viewAll')
                }
            } catch (err) {
                console.log(`Error updating skill: ${err.message}`)
                req.flash('error', `Failed to update skill because ${err.message}.`)
                return res.redirect('/skills/viewAll')
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
                objId: skill.id,
                skillName : skill.name,
                layout : 'layouts',
                styles : ['/assets/stylesheets/style.css']
            }
            return res.render('skills/edit_skill', options)
        } catch (err) {
            console.log(`Something went wrong while fetching skill: ${err.message}`)
            req.flash('error', `Something went wrong while fetching skill because ${err.message}.`)
            return res.redirect('/skills/viewAll')
        }
    },
    destroy : async (req, res, next) => {
        try{
            const deleteSkillIndex = req.user.skills.indexOf(req.query.objId.trim())
            req.user.skills.splice(deleteSkillIndex, 1)
            req.user = await Employee.findByIdAndUpdate({_id:req.user.id}, {skills: req.user.skills}, {new: true})             // new:true ensures updated employee is returned
            let skill = await Skill.findOne({_id : req.query.objId.trim()})
            if(skill.employees.length === 1)
                skill = await Skill.deleteOne({_id : req.query.objId.trim()})           // skill is not returned actually
            else{
                let deleteEmployeeIndex = skill.employees.indexOf(req.user.id)
                skill.employees.splice(deleteEmployeeIndex, 1)
                skill = await Skill.findByIdAndUpdate({_id : skill.id}, {employees : skill.employees}, {new: true})
            }
            req.flash('success', 'Skill deleted successfully.')
            return res.redirect('/skills/viewAll')
        } catch (err) {
            console.log(`Something went wrong while deleting: ${err.message}`)
            req.flash('error', `Something went wrong while deleting because ${err.message}.`)
            return res.redirect('/skills/viewAll')
        }
    },
    getAllSkills : async (req, res, next) => {
        let skillIds = req.user.skills
        let skillPromises = skillIds.map(id => Skill.findOne({_id: id}))
        let skills = await Promise.all(skillPromises)
        const AllSkills = skills.map(skill => {
            return {
                objId: skill.id,
                name: skill.name
            }
        })
        let options = {
            tab_title: "ProfileHunt",
            title : 'All Skills',
            skillList : AllSkills,
            layout : 'layouts',
            styles : ['/assets/stylesheets/style.css'],
            // isAllSkillActive: 'active'
        }
        return res.render('skills/view_all_skills', options);
    },
    getAddSkill : async (req, res, next) => {
        let options = {
            isCreate: true,
            tab_title: "ProfileHunt",
            title : 'Add Skill',
            layout : 'layouts',
            styles : ['/assets/stylesheets/style.css'],
            // isAddSkillActive: 'active'
        }
        return res.render('skills/add_skill', options)
    },
    skillSearch:  async (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            req.flash('error', errors.array().map(e => e.msg + '</br>').join(''))
            return res.redirect('/')
        } else {
            try{
                let skills = await Skill.find({})
                let skilledEmployeeIds = []
                await skills.filter(skill => {
                    return skill.name.toLowerCase().split(" ").includes(req.body.skillName.trim().toLowerCase()) || (skill.name.toLowerCase() === req.body.skillName.trim().toLowerCase())
                }).map(skill => {
                    skilledEmployeeIds = skilledEmployeeIds.concat(skill.employees.map( str => str.toString() ))
                })
                let uniqueSkilledEmployeeIds = [...new Set(skilledEmployeeIds)]
                let employeePromises = uniqueSkilledEmployeeIds.map(id => Employee.findOne({_id: id}))
                let skilledEmployees = await Promise.all(employeePromises)
                if(skilledEmployees.length > 0)
                    skilledEmployees = getPartialEmployeeFromEmployeeObject(skilledEmployees)
                let options = {
                    tab_title: "ProfileHunt",
                    title : 'Skill Search',
                    layout : 'layouts',
                    styles : ['/assets/stylesheets/style.css'],
                    employeeList : skilledEmployees
                }
                return res.render('skills/skill_search', options)
            } catch (err){
                console.log(`Something went wrong while fetching skill: ${err.message}`)
                req.flash('error', `Something went wrong while searching skill because ${err.message}.`)
                return res.redirect('back')
            }
        }
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