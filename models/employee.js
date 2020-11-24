const mongoose = require('mongoose')
const Schema = mongoose.Schema
const SchemaTypes = mongoose.SchemaTypes
const passportLocalMongoose = require('passport-local-mongoose')
// const bcrypt = require('bcrypt')

const EmployeeSchema = new Schema({
    name: {
        first: {
            type: String,
            required: [true, 'First Name is required.'],
            minLength: [2, "Minimum First Name length is 2."],
            trim: true
        },
        last: {
            type: String,
            required: [true, 'Last Name is required.'],
            minLength: [2, "Minimum Last Name length is 2."],
            trim: true
        }
    },
    phNumber: {
        type: String,
        required: [true, 'Phone Number is required.'],
        minLength: [10, "Phone Number Should be of length 10."],
        maxLength: [10, "Phone Number Should be of length 10."],
        unique: true,
        trim: true
    },
    departmentId: {
        type: String,
        required: [true, 'Department is required.'],
        trim: true
    },
    jobTitle: {
        type: String,
        required: [true, 'Job Title is required.'],
        minLength: [2, "Minimum Job Title length is 2."],
        trim: true
    },
    jobRole: {
        type: String,
        required: [true, 'Job Role is required.'],
        minLength: [5, "Minimum Job Role length is 5."],
        trim: true,
    },
    skills: [
        {
            type: SchemaTypes.ObjectID,
            ref: 'Skill'
        }
    ]
})

EmployeeSchema.virtual('fullName').get(function(){
    return `${this.name.first} ${this.name.last}`
})

EmployeeSchema.set('toJSON', {getters: true, virtuals: true})
EmployeeSchema.set('toObject', {getters: true, virtuals: true})

/*EmployeeSchema.pre('save', async function(next){
    let employee = this
    try {
        let phNumber = employee.phNumber.toString()
        employee.phNumber = await bcrypt.hash(phNumber, 10)
        employee.jobTitle = await bcrypt.hash(employee.jobTitle, 10)
        employee.jobRole = await bcrypt.hash(employee.jobRole, 10)
    } catch (err) {
        console.log(`Error in bcrypt hashing : ${err.message}`)
    }
})

EmployeeSchema.methods.decryptEmployee = async function(inputEmployee) {
    let employee = this
    inputEmployee.phNumber = await bcrypt.compare(inputEmployee.phNumber, employee.phNumber)
    inputEmployee.jobTitle = await bcrypt.compare(inputEmployee.jobTitle, employee.jobTitle)
    inputEmployee.jobRole = await bcrypt.compare(inputEmployee.jobRole, employee.jobRole)
    return inputEmployee
}*/

EmployeeSchema.plugin(passportLocalMongoose, {
    usernameField: 'email'
})

exports.Employee = mongoose.model('employees', EmployeeSchema)