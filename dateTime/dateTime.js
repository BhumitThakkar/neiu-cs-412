let dateTime = require('date-and-time')

exports.getDateTime = function (){
    setInterval(function(){
        const now = new Date();
        document.getElementById("date").innerText = dateTime.format(now, 'ddd, MMM DD YYYY')
        document.getElementById("time").innerText = dateTime.format(now, 'hh:mm:ss A')
    }, 1000)
}