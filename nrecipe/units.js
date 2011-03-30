var template = require('./template')
  , error = require('./error')
  , util = require('../lib/util')
  , dbi = require('./dbi')
  , routes = { view : view
             , list : list
             , replace : replace
             , remove : remove
             , search : search
             }

function reroute (req, res, path) {
  var route = routes[path[2]]
  if (route == undefined) {
    route = error.reroute
  }
  route(req,res,path)
}

function view (req,res,path) {
  res.send(template.process('units', {title: 'Units manager'}, 'extjs'))
}

function list (req,res,path) {
  var body = req.body || {}
  dbi.fetch( dbi.Units
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
  var units = db.collection('units')
    , modified = util.dateTime()
  units.save( { _id: dbi.ObjectID(req.body._id) || undefined
              , name: req.body.name
              , type: req.body.type
              , conversion: req.body.conversion
              , modified: modified
              }
            , function (err) {
                if (err != null) console.log(err)
                res.send({success: err == null})
              }
            )
}

function remove (req,res,path,db) {
  var units = db.collection('units')
  units.remove( { _id: dbi.ObjectID(req.body._id)
                }
              , function (err) {
                  if (err != null) console.log(err)
                  res.send({success: err == null})
                }
              )
}

function search (req,res,path,db) {
  db.collection('units')
    .find( {$where: 'this.name.match("' + req.body.query +'")' }
         , {_id: 1, name: 1}
         )
    .limit(100)
    .toArray( function (err, array) {
       res.send({rows: array})
    } )
}

this.reroute = reroute
