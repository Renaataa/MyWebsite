var lib = require('./lib')

module.exports = {
    handle: function(env){
        switch(env.req.method) {    
            case 'GET':
                break            
            case 'POST':
                env.sessionDate.login = env.parsedPayload.login
                break
            case 'DELETE':
                delete env.sessionDate.login 
                break
            default:
                lib.serveError(env.res, 405, 'method not implemented')
                return
        }
        lib.serveJson(env.res, {session: env.session, login: env.sessionDate.login})
    }
}