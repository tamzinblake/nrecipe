var models = require('./lib/models')
  , routes = { index       : require('./lib/index')
             , error       : require('./lib/error')
             , js          : require('./lib/sendfile')
             , bugs        : require('./lib/crudFactory')(
                 { Model: models.Bug
                 , title: 'Bug tracker'
                 }
               )
             , ingredients : require('./lib/crudFactory')(
                 { Model: models.Ingredient
                 , title: 'Ingredients manager'
                 }
               )
             , lists       : require('./lib/crudFactory')(
                 { Model: models.List
                 , title: 'List builder'
                 }
               )
             , recipes     : require('./lib/crudFactory')(
                 { Model: models.Recipe
                 , title: 'Recipe manager'
                 }
               )
             , units       : require('./lib/crudFactory')(
                 { Model: models.Unit
                 , title: 'Units manager'
                 }
               )
             }

function reroute (req, res) {
  var path = split_params(req.params[0])
    , route = routes[path[1]]

  if (route == undefined) {
    route = routes['error']
  }

  route(req,res,path)
}

function split_params (params) {
  if (params == undefined) {
    return ['','index']
  }
  else {
    return params.split(/\//)
  }
}

module.exports = reroute
