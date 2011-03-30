var models = require('./models')
  , routes = { index       : require('./index')
             , error       : require('./error')
             , js          : require('./sendfile')
             , bugs        : require('./crudFactory')(
                 { Model: models.Bug
                 , title: 'Bug tracker'
                 }
               )
             , ingredients : require('./crudFactory')(
                 { Model: models.Ingredient
                 , title: 'Ingredients manager'
                 }
               )
             , lists       : require('./crudFactory')(
                 { Model: models.List
                 , title: 'List builder'
                 }
               )
             , recipes     : require('./crudFactory')(
                 { Model: models.Recipe
                 , title: 'Recipe manager'
                 }
               )
             , units       : require('./crudFactory')(
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

this.reroute = reroute
