var lib = module.exports = {

    serveJson: function(res, obj, code = 200) {
        res.writeHead(code, { "Content-Type": 'application/json' })
        res.write(JSON.stringify(obj))
        res.end()
    },
    
    serveError: function(res, code, message = 'Error occured') {
        lib.serveJson(res, { error: message }, code)
    }
}