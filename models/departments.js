const _department_key = Symbol('key')
const _department_name = Symbol('name')
const _department_head = Symbol('head')

exports.Department = class Department {
    constructor(key, name, head) {
        this[_department_key] = key
        this[_department_name] = name
        this[_department_head] = head
    }

    get key() { return this[_department_key] }
    get name() { return this[_department_name] }
    get head() { return this[_department_head] }
    set name(newName) { this[_department_name] = newName }
    set head(newHead) { this[_department_head] = newHead }
}

exports.AbstractDepartmentsStore = class AbstractDepartmentsStore {
    async close() {}
    async update(key, name, head) {}
    async create(key, name, head) {}
    async read(key) {}
    async destroy(key) {}
    async keyList() {}
    async count() {}
}