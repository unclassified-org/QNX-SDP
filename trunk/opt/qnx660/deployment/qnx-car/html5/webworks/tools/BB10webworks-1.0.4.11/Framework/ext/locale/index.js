/**
 * Manages the system locale information
 *
 * @author mlapierre
 * $Id: index.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _wwfix = require("../../lib/wwfix"),
	_event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
	_actionMap = {
		/**
		 * @event
		 * Triggered when the locale is changed
		 */
		localechanged: {
			context: require("./context"),
			event: "localechanged",
			trigger: function (args) {
				_event.trigger("localechanged", args);
			}
		},
	},
	_locale = require("./locale");

/**
 * Initializes the extension 
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
		_locale.init();
	} catch (ex) {
		console.error('Error in webworks ext: locale/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Returns the current locale
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	get: function(success, fail, args, env) {
		try {
			success(_locale.get());
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Sets the current locale
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 * 		locale: {String},
	 *	}
	 * @param env {Object} Environment variables
	 */
	set: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_locale.set(args.locale);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Returns the current locale data
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getData: function(success, fail, args, env) {
		try {
			success(_locale.getData());
		} catch (e) {
			fail(-1, e);
		}
	},
};

