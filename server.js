var http = require('http')
var url = require('url')
var static = require('node-static')
var cookies = require('cookies')
var uuid = require('uuid')

var config = require('./config')
var db = require('./db')
var rest = require('./rest')

var httpServer = http.createServer()
var fileServer = new static.Server(config.frontendDir)

// sessions = {"1000cc4d-d988-4866-afeb-a4ad48d81319": {}, ...}
var sessions = {}

httpServer.on('request', function(req, res) {
    
    var appCookies = new cookies(req, res)
    var session = appCookies.get('session')
    var now = Date.now()
    if(!session || !sessions[session]) {
        session = uuid.v4()
        sessions[session] = {from: req.connection.remoteAddress, created: now, touched: now}
    } else sessions[session].touched = now
    appCookies.set('session', session, {httpOnly: false})


    var env = {
        req: req,
        res: res,
        parsedUrl: {},
        parsedPayload: {},
        session: session,
        sessionDate: sessions[session]
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
        console.log(env.session, JSON.stringify(env.sessionDate), req.method, env.parsedUrl.pathname, JSON.stringify(env.parsedUrl.query), JSON.stringify(env.parsedPayload))
        
        if(!rest.handle(env)) {
            fileServer.serve(req, res)
        }
    })
})                        

db.init(function() {
    console.log('Database connected, starting http server')
    httpServer.listen(config.port)
})