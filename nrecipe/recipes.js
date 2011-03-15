var template = require('./template')
  , error = require('./error')
  , routes = { view : view
             }

function reroute (req, res, path) {
  var route = routes[path[2]]
  if (route == undefined) {
    route = error.reroute
  }
  route(req, res, path)
}

function view (req, res, path) {
  res.send(template.process('recipes', {title: 'Recipe manager'}, true))
}

this.reroute = reroute
