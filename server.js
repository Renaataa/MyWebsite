var http = require('http')
var url = require('url')
var static = require('node-static')
var mongodb = require('mongodb')

var lib = require('./lib')
var collectionRest = require('./collectionRest')

var httpServer = http.createServer()
var fileServer = new static.Server('./public')

var personCollection = null
var historyCollection = null
var groupCollection = null

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
                lib.serveError(res, 406, 'id broken')
                return
            }
        }
        switch(parsedUrl.pathname) {
            case '/person':
                collectionRest.handle(personCollection, _id, parsedPayload, req, res)
                    break 
            case '/group':
                collectionRest.handle(groupCollection, _id, parsedPayload, req, res)
                    break            
            case '/transfer':
                var recipient = null
                try {
                    recipient = mongodb.ObjectID(parsedUrl.query.recipient)
                } catch(ex) {
                    lib.serveError(res, 406, 'recipient id broken')
                    return
                }
                switch(req.method) {                
                    case 'GET':
                        historyCollection.find({ recipient: recipient }).toArray(function(err, result) {
                            if(err)
                                lib.serveError(res, 404, 'no transfers')
                            else
                                lib.serveJson(res, result)
                        })
                        break                
                    case 'POST':
                        personCollection.findOne({ _id: recipient }, function(err, result) {
                            if(err || !result)
                                lib.serveError(res, 404, 'object not found')
                            else {
                                var oldAmount = isNaN(result.amount) ? 0 : result.amount
                                var delta = isNaN(parsedPayload.delta) ? 0 : parsedPayload.delta
                                var newAmount = oldAmount + delta
                                personCollection.findOneAndUpdate({ _id: recipient }, { $set: { amount: newAmount } },
                                    { returnOriginal: false }, function(err, result) {
                                    if(err || !result.value)
                                        lib.serveError(res, 400, 'transfer failed')
                                    else {
                                        var updatedPerson = result.value
                                        historyCollection.insertOne({
                                            date: new Date().getTime(),
                                            recipient: recipient,
                                            amount_before: oldAmount,
                                            delta: delta,
                                            amount_after: newAmount
                                        }, function(err, result) {
                                            lib.serveJson(res, updatedPerson)
                                        })
                                    }
                                })
                            }
                        })
                        break                    
                    default:
                        lib.serveError(res, 405, 'method not implemented')
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
    groupCollection = db.collection('groups')
    console.log('Database connected, starting http server')
                        
    httpServer.listen(8889)
})
