var template = require('./template')
  , error = require('./error')
  , util = require('../lib/util')
  , dbi = require('./dbi')
  , routes = { view : view
             , list : list
             , replace : replace
             , remove : remove
             }

function reroute (req, res, path) {
  var route = routes[path[2]]
  if (route == undefined) {
    route = error.reroute
  }
  route(req,res,path)
}

function view (req,res,path,db) {
  res.send(template.process('bugs', {title: 'Bug tracker'}, 'extjs'))
}

function list (req,res,path) {
  dbi.fetch( dbi.Bug
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

function replace (req,res,path) {
  var doc = req.body.doc
  doc.modified = util.dateTime()

  dbi.save( dbi.Bug
          , doc
          , function (err) {
              if (err != null) console.log(err)
              res.send({success: err == null})
            }
          )
}

function remove (req,res,path) {
  var doc = req.body.doc
  dbi.remove( dbi.Bug
            , doc
            , function (err) {
                if (err != null) console.log(err)
                res.send({success: err == null})
              }
            )
}

this.reroute = reroute
