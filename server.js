var http = require('http')
var url = require('url')
var static = require('node-static')
var mongodb = require('mongodb')

var lib = require('./lib')
var collectionRest = require('./collectionRest')
const transfer = require('./transfer')

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
                transfer.do(historyCollection, personCollection, parsedUrl, parsedPayload, req, res)
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
