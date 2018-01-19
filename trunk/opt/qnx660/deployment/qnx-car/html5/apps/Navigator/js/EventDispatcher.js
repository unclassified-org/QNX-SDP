Navigator.ns('Navigator');

/**
 * Provides event listening and dispatching functionality to other 
 * framework classes 
 *
 * @author mlapierre
 * $Id: EventDispatcher.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Navigator.EventDispatcher = function() {

	var	self = this,
		listeners = {};

	///// EVENTS /////

	///// PRIVATE METHODS /////

	///// PUBLIC METHODS /////

	/**
	 * Short-hand function for addListener
	 * @param e {String} The event string
	 * @param fn {Function} The callback function
	 */
	self.on = function(e, fn) {
		self.addListener(e,fn);
	};

	/**
	 * Adds an event listener to the current object
	 * @param e {String} The event string
	 * @param fn {Function} The callback function
	 */
	self.addListener = function(e, fn) {
		if (typeof e == 'string' && typeof fn == 'function') {
			if (typeof listeners[e] == 'undefined') {
				listeners[e] = new Array();
			} 
			listeners[e].push(fn);
		}
	};

	/**
	 * Removes an event listener from the current object
	 * @param e {String} The event string
	 * @param fn {Function} The callback function
	 */
	self.removeListener = function(e, fn) {
		if (typeof e == 'string' && typeof fn == 'function' && typeof listeners[e] == 'object') {
			var idx = listeners[e].indexOf(fn);
			if (idx >= 0) {
				listeners[e].splice(idx, 1);
			}
		} 
	};
	
	/**
	 * Dispatch an event
	 * @param e {String} The event string
	 * @param data {Object} The configuration object for the current event [optional]
	 */
	self.dispatch = function(e, data) {
		if (typeof e == 'string' && typeof listeners[e] == 'object') {
			var fns = listeners[e];
			for (var i=0; i<fns.length; i++) {
				try {
					fns[i]({ event: e, data: data });	//TODO move this to asynchronous code (web workers?)
				} catch(e) {
					console.log(e);
				}
			}
		}
	};
}