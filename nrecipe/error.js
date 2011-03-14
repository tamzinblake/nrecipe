var template = require('./template')
var route = function(req, res, path) {
  view(req, res, path)
}

var view = function(req, res, path) {
  res.send(template.process('error'))
}

this.route = route
