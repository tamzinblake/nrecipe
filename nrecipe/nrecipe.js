var routes = { index       : require('./index')
             , bugs        : require('./bugs')
             , error       : require('./error')
             , ingredients : require('./ingredients')
             , lists       : require('./lists')
             , js          : require('./sendfile')
             , recipes     : require('./recipes')
             , units       : require('./units')
             }

function reroute (req, res) {
  var path = split_params(req.params[0])
    , route = routes[path[1]]

  if (route == undefined) {
    route = routes['error']
  }
  route.reroute(req,res,path)
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
