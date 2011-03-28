var mongoose = require('mongoose')
  , util = require('../lib/util')

mongoose.connect('mongodb://localhost/my_database');
this.ObjectId = mongoose.Schema.ObjectId

var BugSchema = new mongoose.Schema(
  { _id : this.ObjectId
  , name: String
  , type: String
  , description : String
  , modified: Date
  }
)

mongoose.model('Bug', BugSchema)
this.Bug = mongoose.model('Bug')

function fetch (model, config, callback) {
  var callbacks = 0
    , response = { success: true }
    , sortInfo = {}
  sortInfo[config.sort] = config.dir

  model.find( {}
            , []
            , { skip: config.start
              , limit: config.limit
              , sort: sortInfo
              }
            , function (err, result) {
                response.rows = result
                respond(err)
              }
            )

  model.count({}, function (err, result) {
    response.totalcount = result
    respond(err)
  } )

  function respond(err) {
    if (err != null) {
      console.log(err)
      callbacks = 2
      response = { success    : false
                 , rows       : []
                 , totalcount : 0
                 }
    }
    callbacks++
    if (callbacks == 2) {
      callback( response )
    }
  }
}

function save(model, doc, callback) {
  var instance = new model()
  util.apply(instance,doc)
  instance.save(function (err) { callback(err) } )
}

function remove(model, doc, callback) {
  var instance = new model()
  util.apply(instance,doc)
  instance.remove(function (err) { callback(err) } )
}

this.fetch = fetch
this.save = save
this.remove = remove
