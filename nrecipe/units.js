var template = require('./template')
  , error = require('./error')
  , routes = { view : view
             }

var reroute = function(req, res, path) {
  var route = routes[path[2]]
  if (route == undefined) {
    route = error.reroute
  }
  route(req, res, path)
}

var view = function(req, res, path) {
  res.send(template.process('units'))
}

this.reroute = reroute
