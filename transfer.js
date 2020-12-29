var mongodb = require('mongodb')

var lib = require('./lib')
var db = require('./db')

module.exports = {
    
    perform: function(env) {
        var recipient = null
        try {
            recipient = mongodb.ObjectID(env.parsedUrl.query.recipient)
        } catch(ex) {
            lib.serveError(env.res, 406, 'recipient id'+ env.parsedUrl.query.recipient + ' broken')
            return
        }
        switch(env.req.method) {                
            case 'GET':
                db.historyCollection.find({ recipient: recipient }).toArray(function(err, result) {
                    if(err)
                        lib.serveError(env.res, 404, 'no transfers')
                    else
                        lib.serveJson(env.res, result)
                })
                break                
            case 'POST':
                db.personCollection.findOne({ _id: recipient }, function(err, result) {
                    if(err || !result)
                        lib.serveError(env.res, 404, 'object not found')
                    else {
                        var oldAmount = isNaN(result.amount) ? 0 : result.amount
                        var delta = isNaN(env.parsedPayload.delta) ? 0 : env.parsedPayload.delta
                        var newAmount = oldAmount + delta
                        db.personCollection.findOneAndUpdate({ _id: recipient }, { $set: { amount: newAmount } },
                            { returnOriginal: false }, function(err, result) {
                            if(err || !result.value)
                                lib.serveError(env.res, 400, 'transfer failed')
                            else {
                                var updatedPerson = result.value
                                db.historyCollection.insertOne({
                                    date: new Date().getTime(),
                                    recipient: recipient,
                                    amount_before: oldAmount,
                                    delta: delta,
                                    amount_after: newAmount
                                }, function(err, result) {
                                    lib.serveJson(env.res, updatedPerson)
                                })
                            }
                        })
                    }
                })
                break                    
            default:
                lib.serveError(env.res, 405, 'method not implemented')
        }
    }

}