var mongodb = require('mongodb')
var lib = require('./lib')

var transfer = module.exports = {
    
    do: function(historyCollection, personCollection, parsedUrl, parsedPayload, req, res) {
        var recipient = null
        try {
            recipient = mongodb.ObjectID(parsedUrl.query.recipient)
        } catch(ex) {
            lib.serveError(res, 406, 'recipient id broken')
            return
        }
        switch(req.method) {                
            case 'GET':
                historyCollection.find({ recipient: recipient }).toArray(function(err, result) {
                    if(err)
                        lib.serveError(res, 404, 'no transfers')
                    else
                        lib.serveJson(res, result)
                })
                break                
            case 'POST':
                personCollection.findOne({ _id: recipient }, function(err, result) {
                    if(err || !result)
                        lib.serveError(res, 404, 'object not found')
                    else {
                        var oldAmount = isNaN(result.amount) ? 0 : result.amount
                        var delta = isNaN(parsedPayload.delta) ? 0 : parsedPayload.delta
                        var newAmount = oldAmount + delta
                        personCollection.findOneAndUpdate({ _id: recipient }, { $set: { amount: newAmount } },
                            { returnOriginal: false }, function(err, result) {
                            if(err || !result.value)
                                lib.serveError(res, 400, 'transfer failed')
                            else {
                                var updatedPerson = result.value
                                historyCollection.insertOne({
                                    date: new Date().getTime(),
                                    recipient: recipient,
                                    amount_before: oldAmount,
                                    delta: delta,
                                    amount_after: newAmount
                                }, function(err, result) {
                                    lib.serveJson(res, updatedPerson)
                                })
                            }
                        })
                    }
                })
                break                    
            default:
                lib.serveError(res, 405, 'method not implemented')
        }
    }

}