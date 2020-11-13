const express = require('express')
const path = require('path')
const logger = require('morgan')
const http = require('http')
const hbs = require('express-handlebars')
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const connectFlash = require('connect-flash')
const mongoose = require('mongoose')

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

app.use(express.static(path.join(__dirname, 'public')))        // static search starts from public for all request
app.use('/assets/vendor/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')))              // static search for specific request
app.use('/assets/vendor/jquery', express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist')))                    // static search for specific request
app.use('/assets/vendor/popper.js', express.static(path.join(__dirname, 'node_modules', 'popper.js', 'dist', 'umd')))       // static search for specific request
app.use('/assets/vendor/feather-icons', express.static(path.join(__dirname, 'node_modules', 'feather-icons', 'dist')))       // static search for specific request

app.use((req, res, next) => {
    res.locals.flashMessages = req.flash()
    next()
})

// Router function lists
app.use('/', indexRouter)
app.use('/departments', departmentsRouter)
app.use('/employees', employeesRouter)

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