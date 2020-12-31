var lib = require('./lib')
var db = require('./db')

var serveSession = function(env){
    lib.serveJson(env.res, {
        session: env.session, 
        login: env.sessionDate.login, 
        firstName: env.sessionDate.firstName,
        role: env.sessionDate.role
    })
}

module.exports = {
    handle: function(env){
        switch(env.req.method) {    
            case 'GET':
                serveSession(env)
                break            
            case 'POST':
                db.personCollection.findOne({email: env.parsedPayload.login}, function(err, result){
                    if(err || !result) {
                        lib.serveError(env.res, 401, 'authorization failed') // bad email        
                        return
                    }
                    db.credentialsCollection.findOne({person_id: result._id}, function(err, result2){
                        if(err || !result2 || result2.password != env.parsedPayload.password){
                            lib.serveError(env.res, 401, 'authorization failed') // no credentials or bad password        
                            return
                        }
                        env.sessionDate.login = env.parsedPayload.login
                        env.sessionDate.firstName = result.firstName
                        env.sessionDate.role = result2.role
                        serveSession(env)
                    })
                })
                break
            case 'DELETE':
                delete env.sessionDate.login 
                delete env.sessionDate.firstName
                delete env.sessionDate.role
                serveSession(env)
                break
            default:
                lib.serveError(env.res, 405, 'method not implemented')
                return
        }
    }
}