var template = require('./template')
var index = require('./index')

var routes =
  { '/' : index.view
  , '/404' : error
  }

var reroute = function(req, res) {
  var path = split_params(req.params[0])
    , route = routes[path[0]]

  if (route == undefined) {
    route = routes['/404']
  }

  route(req,res,path)
}

var split_params = function(params) {
  if (params == undefined) {
    return ['/']
  }
  else {
    return params.split(/\//)
  }
}

var error = function(req, res, path) {
  res.send('404 not found')
}

this.reroute = reroute
