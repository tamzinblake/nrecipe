var template = require('./template')

var routes =
  { 'index' : { name: 'index'
              , type: 'template'
              }
  , 'error' : { name: 'error'
              , type: 'template'
              }
  }

var paths =
  { '/' : 'index'
  , '/foo' : 'index'
  }

var reroute = function(req, res) {
  var rv
    , path = req.params[0] || '/'
    , route = routes[paths[path]]

  if (route == undefined) {
    route = routes['error']
  }

  if (route.type == 'template') {
    rv = template.process(route.name)
  }
  res.send(rv)
}

this.reroute = reroute
