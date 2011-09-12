// This file should be included with any javascript that uses extjs
//
// Important extjs variables
//

//blank image for formatting
Ext.BLANK_IMAGE_URL = '/ext/resources/images/default/s.gif'

//Workarounds for funny window behavior
Ext.WindowMgr.zseed = 10000
var userWindowGroup = new Ext.WindowGroup()
userWindowGroup.zseed = 9000

//utils

function formatDate (v, rec) {
  return (new Date(v)).format('Y-m-d H:i:s')
}

//
//Implementations of state handler methods
//

Ext.form.StatefulFilterBox = Ext.extend(Ext.form.ComboBox
 ,{ getState: function(){
      return this.getValue()
    }
  , applyState: function(state){
      if (this.store.find('value', state) > -1) {
        this.setValue(state)
      }
    }
  } )

Ext.StatefulPagingToolbar = Ext.extend(Ext.PagingToolbar
 ,{ getState: function () {
      return this.cursor
    }
  , applyState: function (state) {
      this.cursor = state
    }
  } )

//
//Extjs cookie-based state session provider
//

Ext.state.SessionProvider = Ext.extend(Ext.state.CookieProvider
 ,{ readCookies : function () {
      if (this.state) {
        for (var k in this.state) {
          if (typeof this.state[k] == 'string') {
            this.state[k] = this.decodeValue(this.state[k])
          }
        }
      }
      return Ext.apply( this.state || {}
                      , Ext.state
                           .SessionProvider
                           .superclass
                           .readCookies
                           .call(this)
                      )
    }
  } )

var sessionProvider = new Ext.state.SessionProvider({state: Ext.appState})
Ext.state.Manager.setProvider(sessionProvider)

//
//Implementations of AJAX error handling
//

var errorText = { codeLabel: 'Error Code: '
                , httpLabel: 'HTTP error'
                , title: 'Errors'
                , 1401: 'Unknown connection error'
                , 1402: 'An invalid response was received from the server'
                , 2401: 'Unknown connection error'
                , 2402: 'An invalid response was received from the server'
                , 3401: 'Unknown connection error'
                , 3402: 'An invalid response was received from the server'
                , 4401: 'Unknown connection error'
                , 4402: 'An invalid response was received from the server'
                , reserved: ''
                }

function showError (title, text, url, extra) {
  if (url) {
    text += 'URL: ' + url + '<br>'
  }
  if (extra) {
    text += extra
  }
//  Ext.MessageBox.alert(title, text)
}

function formatError (code, text) {
  var rv = text + '<br>'
  if (code) {
    rv += errorText.codeLabel + code + '<br>'
  }
  return rv
}

function httpError (code, text) {
  return formatError(code + ' ' + text, errorText.httpLabel)
}

function localError (code) {
  return formatError(code, errorText[code])
}

function failureGeneric (source, status, statusText, url, errors, extra) {
  var errorstring
  if (!status) {
    errorstring = localError(''+source+'401')
  }
  else if (status != 200) {
    errorstring = httpError(status, statusText)
  }
  else if (errors && errors.message) {
    errorstring = formatError(errors.code, errors.message)
    Ext.iterate(errors, function (key, value) {
      if (key != 'code' && key != 'message') {
        errorstring += key + ': ' + value + '<br>'
      }
    }, this )
  }
  else {
    errorstring = localError(''+source+'402')
  }
  showError(errorText.title, errorstring, url, extra)
}

function failureForm (form, action) {
  var source = 1
    , status
    , statusText
    , url
    , errors
    , extra

  if (action) {
    if (action.failureType === Ext.form.Action.SERVER_INVALID) {
      status = 200
      if (action.result) {
        errors = action.result.errors
      }
    }
    else if (action.failureType === Ext.form.Action.CONNECT_FAILURE) {
      if (action.response) {
        status = action.response.status
        statusText = action.response.statusText
      }
    }
    if (action.options) {
      url = action.options.url
    }
  }
  failureGeneric(source, status, statusText, url, errors, extra)
}

function successAjax (response,options) {
  var rv = false
  if (response && response.responseText) {
    var r
    try { r = Ext.decode(response.responseText) } catch (err) {}
    if (r && r.success) {
      rv = true
    }
  }
  if (!rv) {
    options.failure(response,options)
  }
  return rv
}

function failureAjax (response, options, extraString) {
  var source = 2
    , status
    , statusText
    , url
    , errors
    , extra = extraString

  if (response) {
    status = response.status
    statusText = response.statusText
    var r
    try { r = Ext.decode(response.responseText) } catch(err) {}
    if (r) {
      errors = r.errors
    }
  }
  if (options) {
    url = options.url
  }
  failureGeneric(source, status, statusText, url, errors, extra)
}

function failureStore (dp, type, action, options, response, arg) {
  var source = 3
    , status
    , statusText
    , url
    , errors
    , extra

  if (type == 'remote') {
    if (response) {
      status = 200
      if (response.raw) {
        errors = response.raw.errors
      }
    }
  }
  else if (type == 'response') {
    if (response) {
      status = response.status
      statusText = response.statusText
    }
  }
  if (options) {
    url = options.url
  }
  failureGeneric(source, status, statusText, url, errors, extra)
}

function failureTree (tl, node, response) {
  var source = 4
    , status
    , statusText
    , url
    , errors
    , extra

  if (response) {
    status = response.status
    statusText = response.statusText
    var r
    try { r = Ext.decode(response.responseText) } catch (err) {}
    if (r) {
      errors = r.errors
    }
  }
  if (tl) {
    url = tl.dataUrl
  }
  failureGeneric(source, status, statusText, url, errors, extra)
}
