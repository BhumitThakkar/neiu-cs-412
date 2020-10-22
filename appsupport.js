/**
 * Normalize a port into a number, string, or false.
 */

exports.normalizePort = function (val) {
    const port = parseInt(val, 10)
    if (isNaN(port))
        return val         // named pipe
    if (port >= 0)
        return port        // port number
    return false;
}

// 404 handler
exports.handle404 = function (req, res, next){
    res.status(404).send('<h2>Sorry, Page not found</h2>')
}

// error handler
exports.basicErrorHandler = function(err, req, res, next) {
    // Defer to built in error handler if headersSent
    if(res.headersSent)
        return next(err)

    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
}

/**
 * Event listener for HTTP server "error" event.
 */

exports.onError = function (error) {
    let port = require('./app').port

    if (error.syscall !== 'listen') {
        throw error
    }

    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

exports.onListening = function () {
    let server = require('./app').server
    let addr = server.address()
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port
    console.log('Listening on ' + bind)
}
