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
                collectionRest.handle(env, db.personCollection)
                break
            case '/group':
                collectionRest.handle(env, db.groupCollection)
                break
            case '/transfer':
                transfer.perform(env)
                break
            default:
                return false
        }
        return true
    }

}
