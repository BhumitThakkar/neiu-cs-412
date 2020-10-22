let Department = require('./departments').Department
let AbstractDepartmentsStore = require('./departments').AbstractDepartmentsStore
let departments = []

exports.InMemoryDepartmentsStore = class InMemoryDepartmentsStore extends AbstractDepartmentsStore {
    async close() {}
    async update(key, name, head){
        departments[key].name = name
        departments[key].head = head
        return departments[key]
    }

    async create(key, name, head){
        departments[key] = new Department(key, name, head)
        return departments[key]
    }

    async read(key){
        if(departments[key])
            return departments[key]
        else
            throw new Error(`Department ${key} does not exist`)
    }

    async destroy(key){
        if(departments[key])
            delete departments[key]
        else
            throw new Error(`Department ${key} does not exist`)
    }

    async keyList() {
        return Object.keys(departments)
    }

    async count() {
        return departments.length
    }
}