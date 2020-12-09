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
    //extract payload
    var payload = ''
    req.on('data', function(data){
        payload += data
    }).on('end', function(){
        //asume that payload is in JSON format
        var data = {}
        try{
            data = JSON.parse(payload)
        }catch(ex){}
        //log request
        console.log(req.method, req.url, data)
        //parse query string
        var parsed = url.parse(req.url, true)
        switch(parsed.pathname){
            case '/person':
                switch(req.method){
                    case 'GET':
                        res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'})
                        res.write(JSON.stringify(person))
                        res.end()
                        break
                    case 'PUT':
                        person.firstName = data.firstName 
                        person.lastName = data.lastName 
                        person.yearOfBirth = parseInt(data.yearOfBirth) 
                        if(isNaN(person.yearOfBirth)) person.yearOfBirth = 2000
                        res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'})
                        res.write(JSON.stringify(person))
                        res.end()
                        break
                    default:
                        serveError(res, 405)
                }
                break
            default:
                fileServer.serve(req, res)
        }
    })  
})

httpServer.listen(8889)
