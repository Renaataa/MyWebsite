var http = require('http')
var url = require('url')
var static = require('node-static')
var mongodb = require('mongodb')

var httpServer = http.createServer()
var fileServer = new static.Server('./public')

var serveJson = function(res, obj, code = 200) {
    res.writeHead(code, { "Content-Type": 'application/json' })
    res.write(JSON.stringify(obj))
    res.end()
}

var serveError = function(res, code) {
    serveJson(res, { error: 'Error occured' }, code)
}

var personCollection = null
/*var persons = [
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
*/

var history = []

httpServer.on('request', function(req, res) {
    //extract payload
    var payload = ''
    req.on('data', function(data) {
        payload += data
    }).on('end', function() {
        //asume that payload is in JSON format
        var parsedPayload = {}
        try {
            parsedPayload = JSON.parse(payload)
        } catch(ex) {}
        //log request
        console.log(req.method, req.url, parsedPayload)
        //parse query string
        var parsedUrl = url.parse(req.url, true)
        //var index = parseInt(parsedUrl.query.index)
        var _idStr = parsedUrl.query._id
        var _id = null
        if(_idStr) {
            try {
                _id = mongodb.ObjectID(_idStr)
            } catch(ex) {
                serveError(res, 400)
                return
            }
        } 
        switch(parsedUrl.pathname) {
            case '/person':
                switch(req.method) {
                    case 'GET':
                        if(_id)
                            personCollection.findOne({ _id: _id}, function(err, result) {
                                if(err || !result)
                                    serveError(res, 404)
                                else
                                    serveJson(res, result)
                            })
                        else {
                            personCollection.find({}).toArray(function(err, result) {
                                serveJson(res, result)
                            })
                        }
                        break
                    case 'POST':
                        personCollection.insertOne(parsedPayload, function(err, result) {
                            if(err || !result.ops || !result.ops[0])
                                serveError(res, 400)
                            else
                                serveJson(res, result.ops[0])
                        })
                        break    
                    case 'PUT':
                        if(_id) {
                            delete parsedPayload._id
                            personCollection.findOneAndUpdate({ _id: _id },
                                                              { $set: parsedPayload },
                                                              { returnOriginal: false }, function(err, result) {
                                if(err || !result.value)
                                    serveError(res, 404)
                                else
                                    serveJson(res, result.value)
                            })
                        } else
                            serveError(res, 400)
                        break
                    case 'DELETE':
                        if(_id) {
                            personCollection.findOneAndDelete({ _id: _id }, function(err, result) {
                                if(err || !result.value)
                                    serveError(res, 404)
                                else
                                    serveJson(res, result.value)
                            })
                        } else {
                            serveError(res, 400)
                        }
                        break
                    default:
                        serveError(res, 405)
                }
                break
                case '/transfer':
                    switch(req.method) {
                        case 'GET':
                            /*
                            if(person)
                                serveJson(res, history.filter(function(el) { return el.recipient == index }))
                            else
                            */
                            serveJson(res, history)
                            break
                        case 'POST':
                            /*
                            if(!person || isNaN(parsedPayload.delta)) {
                                serveError(res, 400)
                            } else {
                                history.push({ date: new Date().getTime(), recipient: index, amount_before: person.amount, delta: parsedPayload.delta })
                                person.amount += parsedPayload.delta
                                serveJson(res, person)
                            }
                            */
                            serveJson(res, [])
                            break
                        default:
                            serveError(res, 405)
                    }
                default:
                    fileServer.serve(req, res)
        }
    })
})    

    mongodb.MongoClient.connect('mongodb://localhost', { useUnifiedTopology: true }, function(err, connection) {
        if(err) {
            console.error('Connection to database failed')
            process.exit(0)
        }    
        var db = connection.db('MyWebsite')
        personCollection = db.collection('persons')
    /*
    personCollection.find({}).toArray(function(err, result){
        persons = result
    })
    */
   console.log('Database connected, starting http server')

   httpServer.listen(8889)
})
