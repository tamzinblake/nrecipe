// This file should be included with any javascript that uses extjs
//
// Important extjs variables
//

//blank image for formatting
Ext.BLANK_IMAGE_URL = '/ext/resources/images/default/s.gif';

//Workarounds for funny window behavior
Ext.WindowMgr.zseed = 10000;
var userWindowGroup = new Ext.WindowGroup();
userWindowGroup.zseed = 9000;

//
//Implementations of state handler methods
//

Ext.form.StatefulFilterBox = Ext.extend(Ext.form.ComboBox,{
    getState: function(){
        return this.getValue();
    },
    applyState: function(state){
        if (this.store.find('value', state) > -1) {
            this.setValue(state);
        }
    }

});

Ext.StatefulPagingToolbar = Ext.extend(Ext.PagingToolbar,{
    getState: function(){
        return this.cursor;
    },
    applyState: function(state){
        this.cursor = state;
    }
});

//
//Extjs cookie-based state session provider
//

Ext.state.SessionProvider = Ext.extend(Ext.state.CookieProvider, {
    readCookies : function(){
        if(this.state){
            for(var k in this.state){
                if(typeof this.state[k] == 'string'){
                    this.state[k] = this.decodeValue(this.state[k]);
                }
            }
        }
        return Ext.apply(this.state || {}, Ext.state.SessionProvider.superclass.readCookies.call(this));
    }
});
var sessionProvider =  new Ext.state.SessionProvider({state: Ext.appState});
Ext.state.Manager.setProvider(sessionProvider);

//
//Implementations of AJAX error handling
//

var error_text = {
    code_label: 'Error Code: ',
    http_label: 'HTTP error',
    title     : 'Errors',
    1401: 'Unknown connection error',
    1402: 'An invalid response was received from the server',
    2401: 'Unknown connection error',
    2402: 'An invalid response was received from the server',
    3401: 'Unknown connection error',
    3402: 'An invalid response was received from the server',
    4401: 'Unknown connection error',
    4402: 'An invalid response was received from the server',
    reserved: ''
};

var show_error = function (title, text, url, extra) {
//    if (url)
//	text += 'URL: ' + url + '<br>';
    if (extra)
	text += extra;
//    Ext.MessageBox.alert(title, text);
};

var format_error = function (code, text) {
    var rv = text + '<br>';
//    if (code)
//	rv += error_text.code_label + code + '<br>';
    return rv;
};

var http_error = function(code, text) {
    return format_error(code + ' ' + text, error_text.http_label);
};

var local_error = function(code) {
    return format_error(code, error_text[code]);
};

var failure_generic = function(source, status, statusText, url, errors, extra) {
    var errorstring;
    if (!status)
	errorstring = local_error(''+source+'401');
    else if (status != 200)
	errorstring = http_error(status, statusText);
    else if (errors && errors.message) {
	errorstring = format_error(errors.code, errors.message);
	Ext.iterate(errors, function (key, value) {
	    if (key != 'code' && key != 'message')
		errorstring += key + ': ' + value + '<br>';
	}, this);
    }
    else
	errorstring = local_error(''+source+'402');
    show_error(error_text.title, errorstring, url, extra);
};

var failure_form = function (form, action) {
    var source = 1;
    var status;
    var statusText;
    var url;
    var errors;
    var extra;

    if (action) {
	if (action.failureType === Ext.form.Action.SERVER_INVALID) {
	    status = 200;
	    if (action.result)
		errors = action.result.errors;
	}
	else if (action.failureType === Ext.form.Action.CONNECT_FAILURE) {
	    if (action.response) {
		status = action.response.status;
		statusText = action.response.statusText;
	    }
	}
	if (action.options)
	    url = action.options.url;
    }

    failure_generic(source, status, statusText, url, errors, extra);
};

var success_ajax = function(response,options) {
    var rv = false;
    if (response && response.responseText) {
	var r;
	try { r = Ext.decode(response.responseText); } catch (err) {}
	if (r && r.success)
	    rv = true;
    }
    if (!rv)
	options.failure(response,options);
    return rv;
};

var failure_ajax = function(response, options, extraString) {
    var source = 2;
    var status;
    var statusText;
    var url;
    var errors;
    var extra = extraString;

    if (response) {
	status = response.status;
	statusText = response.statusText;
	var r;
	try { r = Ext.decode(response.responseText); } catch(err) {}
	if (r)
	    errors = r.errors;
    }
    if (options)
	url = options.url;

    failure_generic(source, status, statusText, url, errors, extra);
};

var failure_store = function(dp, type, action, options, response, arg) {
    var source = 3;
    var status;
    var statusText;
    var url;
    var errors;
    var extra;

    if (type == 'remote') {
	if (response) {
	    status = 200;
	    if (response.raw)
		errors = response.raw.errors;
	}
    }
    else if (type == 'response') {
	if (response) {
	    status = response.status;
	    statusText = response.statusText;
	}
    }
    if (options)
	url = options.url;

    failure_generic(source, status, statusText, url, errors, extra);
};

var failure_tree = function(tl, node, response) {
    var source = 4;
    var status;
    var statusText;
    var url;
    var errors;
    var extra;

    if (response) {
	status = response.status;
	statusText = response.statusText;
	var r;
	try { r = Ext.decode(response.responseText); } catch (err) {}
	if (r)
	    errors = r.errors;
    }
    if (tl)
	url = tl.dataUrl;

    failure_generic(source, status, statusText, url, errors, extra);
};
