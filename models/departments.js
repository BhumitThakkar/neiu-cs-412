exports.AbstractDepartmentsStore = class AbstractDepartmentsStore {
    async close() {}
    async update(key, name, head) {}
    async create(key, name, head) {}
    async read(key) {}
    async destroy(key) {}
    async keyList() {}
    async count() {}
}

const mongoose = require('mongoose')
const DepartmentSchema = new mongoose.Schema({
    key: {
        type: Number,
        required : true,
        unique: true
    },
    name: {
        type: String,
        required: [true, "Name of department is required."],
        minLength: [3, "Minimum name length of department is 3."]
    },
    head: {
        type: String,
        required: [true, "Head of department is required."],
        minLength: [3, "Minimum head of department length is 3."]
    }
})

exports.Department = mongoose.model('departments', DepartmentSchema)