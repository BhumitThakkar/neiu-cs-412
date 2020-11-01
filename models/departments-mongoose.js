let Department = require('./departments').Department
let AbstractDepartmentsStore = require('./departments').AbstractDepartmentsStore

const mongoose = require('mongoose')
const connectDB = async() => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
    } catch (err){
        console.log(err)
    }
}

exports.MongooseDepartmentsStore = class MongooseDepartmentsStore extends AbstractDepartmentsStore {
    async update(key, name, head){
        await connectDB()
        let department = await Department.findOneAndUpdate({key: key}, {
            name: name,
            head: head
        })
        await mongoose.disconnect()
        return department
    }

    async create(key, name, head){
        let nextSafeID = await this.nextSafeID()
        await connectDB()
        let document = new Department({
            key: nextSafeID,
            name : name,
            head : head
        })
        await document.save()
        await mongoose.disconnect()
        return document
    }

    async read(key){
        await connectDB()
        const department = await Department.findOne({key: key})
        await mongoose.disconnect()
        return department
    }

    async destroy(key){
        await connectDB()
        const department = await Department.deleteOne({key: key})
        await mongoose.disconnect()
        return department
    }

    async findAllDepartments() {
        await connectDB()
        const departments = await Department.find({})
        await mongoose.disconnect()
        return departments.map(department => {
            return {
                key: department.key,
                name: department.name,
            }
        })
    }

    async count() {
        await connectDB()
        const count = await Department.countDocuments()
        await mongoose.disconnect()
        return count
    }

    async nextSafeID(){
        await connectDB()
        let nextSafeID
        await Department.countDocuments()
        if(await Department.countDocuments() !== 0)
            nextSafeID = (await Department.find({}).sort({key : -1}).limit(1))[0].key + 1
        else
            nextSafeID = 1
        await mongoose.disconnect()
        return nextSafeID
    }
}