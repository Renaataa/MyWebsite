var http = require('http')
var static = require('node-static')
var url = require('url')

var httpServer = http.createServer()
var fileServer = new static.Server('./public')


var serveJson = function(res, obj, code=200) {
    res.writeHead(code, {"contentType": 'aplication/json'})
    res.write(JSON.stringify(obj))
    res.end()
}

var serveError = function(res, code) {
    serveJson(res, {error: 'Error occured'}, code)
}

var persons = [
    {
    firstName: 'Renata',
    lastName: 'Babenko',
    yearOfBirth: 2001,
    amount: 100.0
    },
    {
    firstName: 'Jan',
    lastName: 'Kowalski',
    yearOfBirth: 1970,
    amount: 500.0
    },
    {
    firstName: 'Balla',
    lastName: 'Poarch',
    yearOfBirth: 1989,
    amount: 10.0
    }
]

var history = []

httpServer.on('request', function (req, res) {
    //extract payload
    var payload = ''
    req.on('data', function(data){
        payload += data
    }).on('end', function(){
        //asume that payload is in JSON format
        var parsedPayload = {}
        try{
            parsedPayload = JSON.parse(payload)
        }catch(ex){}
        //log request
        console.log(req.method, req.url, parsedPayload)
        //parse query string
        var parsedUrl = url.parse(req.url, true)
        var index = parseInt(parsedUrl.query.index)
        var person = null
        if( index >= 0 || index < persons.length) person = persons[index]
        switch(parsedUrl.pathname){
            case '/person':
                switch(req.method){
                    case 'GET':
                        if(person)
                            serveJson(res, person)
                        else
                            serveJson(res, persons)
                        break
                    case 'PUT':
                        Object.assign(person, parsedPayload)
                        serveJson(res, person)
                        break
                    case 'POST':
                        person = {}
                        Object.assign(person, parsedPayload)
                        persons.push(person)
                        serveJson(res, person)
                        break
                    case 'DELETE':
                        if(person){
                            var deleted = {}
                            Object.assign(deleted, person)
                            persons.splice(index, 1)
                            serveJson(res, deleted)
                        }
                        else{
                            serveError(res, 400)
                        }
                        break
                    default:
                        serveError(res, 405)
                }
                break
            case '/transfer':
                switch(req.method){
                    case 'GET':
                        if(person)
                            serveJson(res, history.filter(function(el) { return el.recipient == index }))
                        else
                            serveJson(res, history)
                        break
                    case 'POST':
                        if(!person || isNaN(parsedPayload.delta)) serveError(res, 400)
                        else{
                            history.push({date: new Date().getTime(), recipient: index, amount_before: person.amount, delta: parsedPayload.delta})
                            person.amount += parsedPayload.delta
                            serveJson(res, person)
                        }
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
