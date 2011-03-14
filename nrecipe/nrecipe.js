var routes = { index       : require('./index')
             , bugs        : require('./bugs')
             , error       : require('./error')
             , ingredients : require('./ingredients')
             , lists       : require('./lists')
             , recipes     : require('./recipes')
             , units       : require('./units')
             }

var reroute = function(req, res) {
  var path = split_params(req.params[0])
    , route = routes[path[1]]

  if (route == undefined) {
    route = routes['error']
  }

  route.route(req,res,path)
}

var split_params = function(params) {
  if (params == undefined) {
    return ['','index']
  }
  else {
    return params.split(/\//)
  }
}

this.reroute = reroute
