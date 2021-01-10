var lib = require('./lib')
var db = require('./db')
var login = require('./login')
var collectionRest = require('./collectionRest')
var transfer = require('./transfer')

module.exports = {

    handle: function(env) {
        switch(env.parsedUrl.pathname) {
            case '/login':
                login.handle(env)
                break
            case '/person':
                if(env.sessionDate.role == 1){ 
                    collectionRest.handle(env, db.personCollection)
                } else {
                    lib.serveError(env.res, 403, 'permission denied')
                }
                break
            case '/personList':
                if(env.sessionDate.role == 2 && env.req.method == 'GET'){ 
                    transfer.personList(env)
                } else {
                    lib.serveError(env.res, 403, 'permission denied')
                }
                break
            case '/group':
                collectionRest.handle(env, db.groupCollection)
                break
            case '/transfer':
                if(env.sessionDate.role == 2){
                    transfer.perform(env)
                } else {
                    lib.serveError(env.res, 403, 'permission denied')
                }
                break
            default:
                return false
        }
        return true
    }

}
