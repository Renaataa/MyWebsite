var db = require('./db')
var collectionRest = require('./collectionRest')
var transfer = require('./transfer')

module.exports = {

    handle: function(env) {
        switch(env.parsedUrl.pathname) {
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
