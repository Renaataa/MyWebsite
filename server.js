var http = require('http')
var url = require('url')
var static = require('node-static')
//var mongodb = require('mongodb')

//var lib = require('./lib')
//var collectionRest = require('./collectionRest')
//const transfer = require('./transfer')

var config = require('./config')
var db = require('./db')
var rest = require('./rest')

var httpServer = http.createServer()
var fileServer = new static.Server(config.frontendDir)

//var personCollection = null
//var historyCollection = null
//var groupCollection = null

httpServer.on('request', function(req, res) {
    var env = {
        req: req,
        res: res,
        parsedUrl: {},
        parsedPayload: {},
    }   
    
    //extract payload
    var payload = ''
    req.on('data', function(data) {
        payload += data
    }).on('end', function() {
        //asume that payload is in JSON format
        try {
            env.parsedPayload = JSON.parse(payload)
        } catch(ex) {}
        try {
            env.parsedUrl = url.parse(req.url, true)
        } catch(ex) {}
        //log request
        console.log(req.method, env.parsedUrl.pathname, JSON.stringify(env.parsedUrl.query), JSON.stringify(env.parsedPayload))
        if(!rest.handle(env)) {
            fileServer.serve(req, res)
        }
    })
})                        

db.init(function() {
    console.log('Database connected, starting http server')
    httpServer.listen(config.port)
})