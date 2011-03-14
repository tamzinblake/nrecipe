var y = require('../lib/yajet')
  , yajet = new y.YAJET({})
  , index = require('./index')

var templates = { 'index' : function() { return 'this is an index' }
                , 'error' : function() { return '404 not found' }
                }

exports.process = function(template, vars) {
  return yajet.compile(templates[template || 'error']())(vars)
}
