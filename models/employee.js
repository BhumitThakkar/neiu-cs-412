const mongoose = require('mongoose')
const Schema = mongoose.Schema
const SchemaTypes = mongoose.SchemaTypes
const passportLocalMongoose = require('passport-local-mongoose')
const encryptDecrypt = require('../appsupport').encryptDecrypt

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
    managerId: {
        type: String,
        required: [true, 'Manager is required.'],
        minLength: [2, "Minimum Job Title length is 2."],
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
        trim: true
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

EmployeeSchema.pre('save', async function(next){
    try {
        let employee = this
        let edcrypt = await encryptDecrypt()
        employee.phNumber = edcrypt.encrypt(employee.phNumber)
        employee.jobTitle = edcrypt.encrypt(employee.jobTitle)
        employee.jobRole = edcrypt.encrypt(employee.jobRole)
        next()              // I added next - learnt from hovering on EmployeeSchema.pre()
    } catch (err) {
        console.log(`Error in encrypting employee while saving: ${err.message}.`)
    }
})

EmployeeSchema.methods.encryptEmployeeParams = async function(employeeParam) {
    let edcrypt = await encryptDecrypt()
    if(employeeParam.phNumber)
        employeeParam.phNumber = edcrypt.encrypt(employeeParam.phNumber)
    if(employeeParam.jobTitle)
        employeeParam.jobTitle = edcrypt.encrypt(employeeParam.jobTitle)
    if(employeeParam.jobRole)
        employeeParam.jobRole = edcrypt.encrypt(employeeParam.jobRole)
    return employeeParam
}

EmployeeSchema.methods.decryptEmployee = async function() {
    let employee = this
    let edcrypt = await encryptDecrypt()
    employee.phNumber = await edcrypt.decrypt(employee.phNumber)
    employee.jobTitle = await edcrypt.decrypt(employee.jobTitle)
    employee.jobRole = await edcrypt.decrypt(employee.jobRole)
    return employee
}

EmployeeSchema.plugin(passportLocalMongoose, {
    usernameField: 'email'
})

exports.Employee = mongoose.model('employees', EmployeeSchema)