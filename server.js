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

var serveError = function(res, code, message = 'Error occured') {
    serveJson(res, { error: message }, code)
}

var personCollection = null
var historyCollection = null

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
        // var index = parseInt(parsedUrl.query.index)
        var _idStr = parsedUrl.query._id
        var _id = null
        if(_idStr) {
            try {
                _id = mongodb.ObjectID(_idStr)
            } catch(ex) {
                serveError(res, 406, 'id broken')
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
                                    serveError(res, 404, 'person not found')
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
                                serveError(res, 400, 'insert failed')
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
                                    serveError(res, 404, 'object not found')
                                else
                                    serveJson(res, result.value)
                            })
                        } else
                            serveError(res, 404, 'no person id')
                        break        
                    case 'DELETE':
                        if(_id) {
                            personCollection.findOneAndDelete({ _id: _id }, function(err, result) {
                                if(err || !result.value)
                                    serveError(res, 404, 'object not found')
                                else
                                    serveJson(res, result.value)
                            })
                        } else {
                            serveError(res, 400, 'no person id')
                        }
                        break
                    default:
                        serveError(res, 405, 'method not implemented')
                    }
                    break            
                case '/transfer':
                    var recipient = null
                    try {
                        recipient = mongodb.ObjectID(parsedUrl.query.recipient)
                    } catch(ex) {
                        serveError(res, 406, 'recipient id broken')
                        return
                    }
                    switch(req.method) {                
                        case 'GET':
                            historyCollection.find({ recipient: recipient }).toArray(function(err, result) {
                                if(err)
                                    serveError(res, 404, 'no transfers')
                                else
                                    serveJson(res, result)
                            })
                            break                
                        case 'POST':
                            personCollection.findOne({ _id: recipient }, function(err, result) {
                                if(err || !result)
                                    serveError(res, 404, 'object not found')
                                else {
                                    var oldAmount = isNaN(result.amount) ? 0 : result.amount
                                    var delta = isNaN(parsedPayload.delta) ? 0 : parsedPayload.delta
                                    var newAmount = oldAmount + delta
                                    personCollection.findOneAndUpdate({ _id: recipient }, { $set: { amount: newAmount } },
                                        { returnOriginal: false }, function(err, result) {
                                        if(err || !result.value)
                                            serveError(res, 400, 'transfer failed')
                                        else {
                                            var updatedPerson = result.value
                                            historyCollection.insertOne({
                                                date: new Date().getTime(),
                                                recipient: recipient,
                                                amount_before: oldAmount,
                                                delta: delta,
                                                amount_after: newAmount
                                            }, function(err, result) {
                                                serveJson(res, updatedPerson)
                                            })
                                        }
                                    })
                                }
                            })
                            break                    
                        default:
                            serveError(res, 405, 'method not implemented')
                    }
                    break
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
    historyCollection = db.collection('history')
    console.log('Database connected, starting http server')
                        
    httpServer.listen(8889)
})
