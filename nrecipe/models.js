var mongoose = require('mongoose')
  , util = require('../lib/util')

mongoose.connect('mongodb://localhost/nrecipe');
var ObjectId = mongoose.Schema.ObjectId

var Bug = new mongoose.Schema(
  { _id : ObjectId
  , name: String
  , type: String
  , description : String
  , created: {type: Date, default: Date.now}
  }
)
mongoose.model('Bug', Bug)

var Unit = new mongoose.Schema(
  { _id : ObjectId
  , name: String
  , type: String
  , conversion : Number
  , created: {type: Date, default: Date.now}
  }
)
mongoose.model('Unit', Unit)

module.exports = { Bug: mongoose.model('Bug')
                 , Unit: mongoose.model('Unit')
                 }
