const mongoose = require('mongoose')
const Schema = mongoose.Schema
const SchemaTypes = mongoose.SchemaTypes

const SkillSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name of skill is required."],
        minLength: [3, "Minimum name length of skill is 3."],
        trim: true
    },
    employees: [
        {
            type: SchemaTypes.ObjectID,
            ref: 'Employee'
        }
    ]
})

exports.Skill = mongoose.model('skills', SkillSchema)