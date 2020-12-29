var lib = require('./lib')

var collectionRest = module.exports = {
  
    handle: function(collection, _id, parsedPayload,  req, res){
        switch(req.method) {
            case 'GET':
                if(_id)
                    collection.findOne({ _id: _id}, function(err, result) {
                        if(err || !result)
                            lib.serveError(res, 404, 'object not found')
                        else
                            lib.serveJson(res, result)
                    })
                else {
                    collection.find({}).toArray(function(err, result) {
                        lib.serveJson(res, result)
                    })
                }
                break
            case 'POST':
                collection.insertOne(parsedPayload, function(err, result) {
                    if(err || !result.ops || !result.ops[0])
                        lib.serveError(res, 400, 'insert failed')
                    else
                        lib.serveJson(res, result.ops[0])
                })
                break          
            case 'PUT':
                if(_id) {
                    delete parsedPayload._id
                    collection.findOneAndUpdate({ _id: _id },
                                                        { $set: parsedPayload },
                                                        { returnOriginal: false }, function(err, result) {
                        if(err || !result.value)
                            lib.serveError(res, 404, 'object not found')
                        else
                            lib.serveJson(res, result.value)
                    })
                } else
                    lib.serveError(res, 404, 'no id')
                break        
            case 'DELETE':
                if(_id) {
                    collection.findOneAndDelete({ _id: _id }, function(err, result) {
                        if(err || !result.value)
                            lib.serveError(res, 404, 'object not found')
                        else
                            lib.serveJson(res, result.value)
                    })
                } else {
                    lib.serveError(res, 400, 'no id')
                }
                break
            default:
                lib.serveError(res, 405, 'method not implemented')
            }
    }

}