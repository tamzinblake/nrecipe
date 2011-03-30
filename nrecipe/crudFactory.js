//call this module using require('crudFactory')(config), which returns
//the reroute function
module.exports = init

var template = require('./template')
  , error = require('./error')
  , util = require('../lib/util')
  , dbi = require('./dbi')
  , Model
  , title
  , routes = {}
  , possible_routes = { view: view
                      , list: list
                      , replace: replace
                      , remove: remove
                      , search: search
                      }

function init (config) {
  Model = config.Model
  title = config.title
  for (r in config.routes) {
    routes[config.routes[r]] = possible_routes[config.routes[r]]
  }
  return reroute
}

function reroute (req, res, path) {
  var route = routes[path[2]]
  if (route == undefined) {
    route = error
  }
  route(req,res,path)
}

function view (req,res,path,db) {
  res.send(template.process(path[1], {title: title}, 'extjs'))
}

function list (req,res,path) {
  var body = req.body || {}
  dbi.fetch( Model
           , { start: body.start || 0
             , limit: body.limit || 50
             , dir  : body.dir == 'DESC' ? -1 : 1
             , sort : body.sort || '_id'
             }
           , function (response) {
               res.send(response)
             }
           )
}

function replace (req,res,path) {
  if (req.body && req.body.doc) {
    var doc = JSON.parse(req.body.doc)
    dbi.save( Model
            , doc
            , function (err) {
                if (err != null) console.log(err)
                res.send({success: err == null})
              }
            )
  }
  else {
    res.send({success: false})
  }
}

function remove (req,res,path) {
  if (req.body) {
    dbi.remove( Model
              , req.body._id
              , function (err) {
                  if (err != null) console.log(err)
                  res.send({success: err == null})
                }
              )
  }
  else {
    res.send({success: false})
  }
}

function search (req,res,path) {

}