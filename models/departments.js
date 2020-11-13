const mongoose = require('mongoose')
const Schema = mongoose.Schema
const SchemaTypes = mongoose.SchemaTypes

const DepartmentSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name of department is required."],
        minLength: [3, "Minimum name length of department is 3."],
        unique: [true, "Name of department must be unique."],
        trim: true
    },
    head: {
        type: String,
        required: [true, "Head of department is required."],
        minLength: [3, "Minimum head of department length is 3."],
        trim: true
    },
    employees: [
        {
            type: SchemaTypes.ObjectID,
            ref: 'Department'
        }
    ]
})

exports.Department = mongoose.model('departments', DepartmentSchema)