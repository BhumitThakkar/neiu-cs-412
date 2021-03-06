const express = require('express')
const path = require('path')
const logger = require('morgan')
const http = require('http')
const hbs = require('express-handlebars')
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const connectFlash = require('connect-flash')
const mongoose = require('mongoose')
const passport = require('passport')
const {Employee} = require('./models/employee')
const {Department} = require('./models/departments')

mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    }
).catch(err => {
    console.log(err)
})

const appsupport = require('./appsupport')
const indexRouter = require('./routes/index')
const departmentsRouter = require('./routes/departments')
const employeesRouter = require('./routes/employees')
const skillsRouter = require('./routes/skills')

const app = express()
exports.app = app

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.engine('hbs', hbs({
    extname : 'hbs',
    defaultLayout: 'layouts',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/'
}))

app.use(logger('dev'))
app.use(express.json())                                        // needed for post and put request
app.use(express.urlencoded({ extended: false }))        // needed for post and put request
app.use(session({
    secret: process.env.SECRET,
    cookie: {maxAge: 86400000},
    store: new MemoryStore({
        checkPeriod: 86400000
    }),
    resave: false,
    saveUninitialized: false
}))
app.use(connectFlash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(Employee.createStrategy())
passport.serializeUser(Employee.serializeUser())
passport.deserializeUser(Employee.deserializeUser())

app.use(express.static(path.join(__dirname, 'public')))        // static search starts from public for all request
app.use('/assets/vendor/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')))              // static search for specific request
app.use('/assets/vendor/jquery', express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist')))                    // static search for specific request
app.use('/assets/vendor/popper.js', express.static(path.join(__dirname, 'node_modules', 'popper.js', 'dist', 'umd')))       // static search for specific request
app.use('/assets/vendor/feather-icons', express.static(path.join(__dirname, 'node_modules', 'feather-icons', 'dist')))       // static search for specific request

app.use(async (req, res, next) => {
    req.baseUrl
    res.locals.flashMessages = req.flash()
    res.locals.loggedIn = req.isAuthenticated()
    let employee = req.user ? req.user.toObject() : undefined
    res.locals.loggedInEmployee = employee
    res.locals.showDepartment = false
    res.locals.canAddEmployee = false
    let employeeCount = await Employee.countDocuments()
    if(employee !== undefined){
        let department = await Department.findOne({name: "HR"})
        res.locals.HRDepartmentId = department.id
        if(employee.departmentId === department.id && employeeCount > 1){           // because we can only add department if HR and CEO are added.
            res.locals.showDepartment = true
        }
        if(employee.departmentId === department.id){
            res.locals.canAddEmployee = true
        }
        else {
            if(req.originalUrl.startsWith('/departments')) {
                req.flash('error','Only HR department can access department domain.')
                res.redirect('back');
            }
        }
    }
    res.locals.showAddHR = false
    res.locals.showAddCEO = false
    if(employeeCount === 0){
        res.locals.showAddHR = true
    }
    else if(employeeCount === 1){
        res.locals.showAddCEO = true
    }
    next()
})

// app.use(appsupport.encryptDecrypt)

// Router function lists
app.use('/', indexRouter)
app.use('/departments', departmentsRouter)
app.use('/employees', employeesRouter)
app.use('/skills', skillsRouter)

// Error Handlers
app.use(appsupport.basicErrorHandler)                           // this is a call back because no rounded brackets for basicErrorHandler
app.use(appsupport.handle404)                                   // this is a call back because no rounded brackets for handle404

/**
 * Get port from environment and store in Express.
 */
const port = appsupport.normalizePort(process.env.PORT || '3000')
exports.port = port
app.set('port', port)

/**
 * Create HTTP server.
 */
const server = http.createServer(app);
exports.server = server
/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', appsupport.onError);
server.on('listening', appsupport.onListening);