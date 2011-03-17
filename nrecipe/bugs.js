var template = require('./template')
  , error = require('./error')
  , util = require('../lib/util')
  , dbi = require('./dbi')
  , routes = { view : view
             , list : list
             , replace : replace
             , remove : remove
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
           , { start: req.body.start
             , limit: req.body.limit || 50
             , dir  : req.body.dir == 'DESC' ? -1 : 1
             , sort : req.body.sort
             }
           , function (response) {
               res.send(response)
             }
           )
}

function replace (req,res,path,db) {
  var bugs = db.collection('bugs')
    , modified = util.dateTime()
  bugs.save( { _id: dbi.ObjectID(req.body._id) || undefined
             , description: req.body.description
             , name: req.body.name
             , type: req.body.type
             , modified: modified
             }
           , function (err) {
               if (err != null) console.log(err)
               res.send({success: err == null})
             }
           )
}

function remove (req,res,path,db) {
  var bugs = db.collection('bugs')
  bugs.remove( { _id: dbi.ObjectID(req.body._id)
               }
             , function (err) {
                 if (err != null) console.log(err)
                 res.send({success: err == null})
               }
             )
}

this.reroute = reroute
