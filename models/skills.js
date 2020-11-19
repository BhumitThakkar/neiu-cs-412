const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SkillSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name of skill is required."],
        minLength: [3, "Minimum name length of skill is 3."],
        trim: true
    }
})

exports.Skill = mongoose.model('skills', SkillSchema)