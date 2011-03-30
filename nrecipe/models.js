var mongoose = require('mongoose')
  , util = require('../lib/util')

mongoose.connect('mongodb://localhost/nrecipe');
var ObjectId = mongoose.Schema.ObjectId

var BugSchema = new mongoose.Schema(
  { _id : ObjectId
  , name: String
  , type: String
  , description : String
  , created: {type: Date, default: Date.now}
  }
)

mongoose.model('Bug', BugSchema)

module.exports = { Bug: mongoose.model('Bug')
                 }
