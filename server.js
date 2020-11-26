var http = require('http')
var static = require('node-static')

var httpServer = http.createServer()
var fileServer = new static.Server('./public')

var serveError = (res, code) => {
    res.writeHead(code, {"contentType": 'text/plain; charset-utf-8'})
    res.write('Error')
    res.end()
}

httpServer.on('request', function (req, res) {
        console.log(req.method, req.url)
        if(/^\/rest/.test(req.url))
            serveError(res, 403)
        else
            fileServer.serve(req, res)
    }
)

httpServer.listen(8889)
