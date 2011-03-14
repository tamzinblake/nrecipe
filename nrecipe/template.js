var y = require('../lib/yajet')
  , yajet = new y.YAJET({})

var templates = { index : function() { return 'this is an index' }
                , error : function() { return '404 not found' }
                , bugs : function() { return 'bugs page' }
                , ingredients : function() { return 'ingredients page' }
                , lists : function() { return 'lists page' }
                , recipes : function() { return 'recipes page' }
                , units : function() { return 'units page' }
                }

function process (template, vars) {
  return yajet.compile(templates[template || 'error']())(vars)
}

this.process = process