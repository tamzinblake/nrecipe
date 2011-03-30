var models = require('./models')
  , routes = { index       : require('./index')
             , bugs        : require('./crudFactory')(
                 { Model: models.Bug
                 , title: 'Bug tracker'
                 }
               )
             , error       : require('./error')
             , ingredients : require('./ingredients')
             , lists       : require('./lists')
             , js          : require('./sendfile')
             , recipes     : require('./recipes')
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
