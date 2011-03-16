var template = require('./template')
  , error = require('./error')
  , dbi = require('./dbi')
  , routes = { view : view
             , list : list
             }

function reroute (req, res, path, db) {
  var route = routes[path[2]]
  if (route == undefined) {
    route = error.reroute
  }
  route(req,res,path,db)
}

function view (req,res,path,db) {
  res.send(template.process('bugs', {title: 'Bug tracker'}, true))
}

function list (req,res,path,db) {
  var bugs = db.collection('bugs')
  
  dbi.fetch( bugs
           , { start: req.query.start
             , limit: req.query.limit || 50
             , dir: req.query.dir == 'DESC' ? -1 : 1
             , sort: req.query.sort
             }
           , function (response) {
               res.send(response)
             }
           )
}

this.reroute = reroute
