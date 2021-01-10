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
                db.historyCollection.find({ $or: [
                        { sender: env.sessionDate._id, delta: {$lt: 0} },
                        { recipient: env.sessionDate._id, delta: {$gt: 0} }
                    ]}).toArray(function(err, result) {
                    if(err)
                        lib.serveError(env.res, 404, 'no transfers')
                    else
                        lib.serveJson(env.res, result)
                })
                break                
            case 'POST':
                db.personCollection.findOne({ _id: recipient }, function(err, recipient_data) {
                    if(err || !recipient_data)
                        lib.serveError(env.res, 404, 'object not found')
                    else {
                        var delta = isNaN(env.parsedPayload.delta) ? 0 : env.parsedPayload.delta
                        if(delta <= 0) {
                            lib.serveError(env.res, 403, 'transfer amount should be positive')
                        }
                        db.personCollection.findOne({ _id: env.sessionDate._id }, function(err, sender_data) {
                            if(err) {
                                lib.serveError(env.res, 403, 'sender account not accessible')
                            } else {
                                if(delta > sender_data.amount) {
                                    lib.serveError(env.res, 403, 'not enough money to transfer')
                                } else {
                                    var newSenderAmount = sender_data.amount - delta
                                    db.personCollection.findOneAndUpdate({ _id: env.sessionDate._id }, { $set: { amount: newSenderAmount } },
                                        { returnOriginal: false }, function(err, result) {
                                        if(err || !result.value)
                                            lib.serveError(env.res, 400, 'transfer failed')
                                        else {
                                            var updatedSender = result.value
                                            db.personCollection.findOneAndUpdate({ _id: recipient }, { $inc: { amount: delta } },
                                                { returnOriginal: false }, function(err, result) {
                                                var updatedRecipient = result.value

                                                var now = new Date().getTime()

                                                db.historyCollection.insertOne({
                                                    date: now,
                                                    sender: updatedSender._id,
                                                    recipient: updatedRecipient._id,
                                                    delta: delta,
                                                    amount_after: updatedRecipient.amount
                                                })

                                                db.historyCollection.insertOne({
                                                    date: now,
                                                    sender: updatedSender._id,
                                                    recipient: updatedRecipient._id,
                                                    delta: -delta,
                                                    amount_after: updatedSender.amount
                                                })

                                                lib.serveJson(env.res, updatedSender)
                                            })
                                        }
                                    })
                                }
                            }
                        })
                    }
                })
                break
            default:
                lib.serveError(env.res, 405, 'method not implemented')
        }
    },

    personList: function(env){
        db.personCollection.find({}).toArray(function(err, result){
            if(err){
                lib.serveError(env, 404, 'recipients not found')
            } else {
                lib.serveJson(env.res, result)
            }
        })
    }

}