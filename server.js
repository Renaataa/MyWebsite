var http = require('http')
var static = require('node-static')
var url = require('url')

var httpServer = http.createServer()
var fileServer = new static.Server('./public')

var serveError = (res, code) => {
    res.writeHead(code, {"contentType": 'text/plain; charset-utf-8'})
    res.write('Error')
    res.end()
}

var person ={
    firstName: 'Renata',
    lastName: 'Babenko',
    yearOfBirth: 2001
}

httpServer.on('request', (req, res) => {
    console.log(req.method, req.url)
    var parsed = url.parse(req.url, true)
    switch(parsed.pathname){
        case '/get':
            res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'})
            res.write(JSON.stringify(person))
            res.end()
            break
        case '/set':
            person.firstName = parsed.query.firstName 
            person.lastName = parsed.query.lastName 
            person.yearOfBirth = parseInt(parsed.query.yearOfBirth) 
            if(isNaN(person.yearOfBirth)) person.yearOfBirth = 2000
            res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'})
            res.write(JSON.stringify(person))
            res.end()
            break
        default:
            fileServer.serve(req, res)
        }
})

httpServer.listen(8889)
