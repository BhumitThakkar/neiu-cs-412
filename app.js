const express = require('express')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const http = require('http')
const hbs = require('express-handlebars')

const InMemoryDepartmentsStore = require('./models/departments-memory').InMemoryDepartmentsStore
let departmentsStore = new InMemoryDepartmentsStore()
exports.departmentsStore = departmentsStore

const appsupport = require('./appsupport')
const indexRouter = require('./routes/index')
const departmentsRouter = require('./routes/departments')

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
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))        // static search starts from public

// Router function lists
app.use('/', indexRouter)
app.use('/departments', departmentsRouter)

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