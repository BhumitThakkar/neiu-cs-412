const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

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
    email: {
        type: String,
        required: [true, 'Email is required.'],
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        minLength: [8, "Minimum Password length is 8."],
        required: [true, 'Password is required.'],
        trim: true,
    }
})

EmployeeSchema.virtual('fullName').get(function(){
    return `${this.name.first} ${this.name.last}`
})

EmployeeSchema.pre('save', async function(next){
    let employee = this
    try {
        let phNumber = employee.phNumber.toString()
        console.log(typeof (employee.phNumber.toString()) )
        employee.phNumber = await bcrypt.hash(phNumber, 10)
        employee.jobTitle = await bcrypt.hash(employee.jobTitle, 10)
        employee.jobRole = await bcrypt.hash(employee.jobRole, 10)
        employee.password = await bcrypt.hash(employee.password, 10)
    } catch (err) {
        console.log(`Error in hashing password: ${err.message}`)
    }
})

EmployeeSchema.methods.passwordComparison = async function(inputPassword) {
    let employee = this
    return await bcrypt.compare(inputPassword, employee.password)
}

exports.Employee = mongoose.model('employees', EmployeeSchema)