function fetch (collection, config, callback) {
  var callbacks = 0
    , response = { success: true }
    , sortInfo = {}

  sortInfo[config.sort] = config.dir
  result = collection.find()
                     .skip(config.start)
                     .limit(config.limit)
                     .sort(sortInfo)
  result.toArray(function (err, rv) {
    rows = rv
    respond(err)
  } )
  result.count(function (err, rv) {
    total = rv
    respond(err)
  } )

  function respond(err) {
    if (err != undefined) {
      console.log(err)
      callbacks = 2
      response = { success    : false
                 , rows       : []
                 , totalcount : 0
                 }
    }
    callbacks++
    if (callbacks == 2) {
      if (response.success) {
        response = { success: true
                   , rows: rows
                   , totalcount: total
                   }
      }
      callback( response )
    }
  }
}

this.fetch = fetch
