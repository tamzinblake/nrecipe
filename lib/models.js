var mongoose = require('mongoose')
  , util = require('../../lib/util')

mongoose.connect('mongodb://localhost/nrecipe')
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

var Ingredient = new mongoose.Schema(
  { _id : ObjectId
  , name: String
  , density : Number
  , unit: [Unit]
  , defaultUnit: [Unit]
  , shopUnit: [Unit]
  , amount: Number
  , created: {type: Date, default: Date.now}
  }
)
mongoose.model('Ingredient', Ingredient)

var Recipe = new mongoose.Schema(
  { _id : ObjectId
  , name: String
  , amount: Number
  , ingredients: [Ingredient]
  , created: {type: Date, default: Date.now}
  }
)
mongoose.model('Recipe', Recipe)

var List = new mongoose.Schema(
  { _id : ObjectId
  , name: String
  , recipes: [Recipe]
  , ingredients: [Ingredient]
  , created: {type: Date, default: Date.now}
  }
)
mongoose.model('List', List)

module.exports = { Bug       : mongoose.model('Bug')
                 , Ingredient: mongoose.model('Ingredient')
                 , List      : mongoose.model('List')
                 , Recipe    : mongoose.model('Recipe')
                 , Unit      : mongoose.model('Unit')
                 }
