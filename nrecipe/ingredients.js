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

function reroute (req, res, path, db) {
  var route = routes[path[2]]
  if (route == undefined) {
    route = error.reroute
  }
  route(req,res,path,db)
}

function view (req,res,path,db) {
  res.send(template.process('ingredients'
                           , {title: 'Ingredients manager'}
                           , 'extjs'
                           ) )
}

function list (req,res,path,db) {
  var ingredients = db.collection('ingredients')
  dbi.fetch( ingredients
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
  var ingredients = db.collection('ingredients')
    , modified = util.dateTime()
    , unitId
    , shopUnitId
    , callbacks = 0

  newUnit( req.body.unitId
         , req.body.unit
         , db
         , function (err, id) {
             unitId = id
             saveIngredient(err)
           }
         )

  newUnit( req.body.shopUnitId
         , req.body.shopUnit
         , db
         , function (err, id) {
             shopUnitId = id
             saveIngredient(err)
           }
         )

  function saveIngredient (err) {
    callbacks++
    if (callbacks == 2) {
      ingredients.save( { _id: dbi.ObjectID(req.body._id) || undefined
                        , name: req.body.name
                        , density: req.body.density
                        , unitId: unitId
                        , shopUnitId: shopUnitId
                        , modified: modified
                        }
                      , function (err) {
                          if (err != null) console.log(err)
                          res.send({success: err == null})
                        }
                      )
    }
  }

  function newUnit (id, n, db, callback) {
    var units = db.collection('units')
    id = dbi.ObjectID(id)

    units.find({_id: id}).toArray(function (err, array) {
      if (array.length == 0) {
        units.find({name: n}).toArray(function (err, array) {
          if (array.length == 0) {
            units.save({name: n}, function(err) {
              units.find({name: n}).toArray(function(err, array) {
                callback(err, array[0]._id)
              })
            })
          }
          else {
            callback(err, array[0]._id)
          }
        })
      }
      else {
        callback(err, array[0]._id)
      }
    })
  }
}

function remove (req,res,path,db) {
  var ingredients = db.collection('ingredients')
  ingredients.remove( { _id: dbi.ObjectID(req.body._id)
                      }
                    , function (err) {
                        if (err != null) console.log(err)
                        res.send({success: err == null})
                      }
                    )
}

function search (req,res,path,db) {
  db.collection('ingredients')
    .find({$where: 'this.name =~ ' . req.body.query }, {_id: 1, name: 1})
    .limit(100)
    .toArray( function (err, array) {
       res.send({rows: array})
    } )
}

this.reroute = reroute
