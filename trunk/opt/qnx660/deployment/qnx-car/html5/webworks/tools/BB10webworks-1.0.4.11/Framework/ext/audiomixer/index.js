/**
 * Allows control of volume and other audio parameters
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
		 * Triggered when one of the mixer elements is updated
		 */
		audiomixerupdate: {
			context: require("./context"),
			event: "audiomixerupdate",
			trigger: function (args) {
				_event.trigger("audiomixerupdate", args);
			}
		},
	},
	_audiomixer = require("./audiomixer");

/**
 * Initializes the extension 
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
		_audiomixer.init();
	} catch (ex) {
		console.error('Error in webworks ext: audiomixer/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Returns the current audio parameters
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		settings: {Array}, //a list of settings to get [optional]
	 *	}
	 * @param env {Object} Environment variables
	 */
	get: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(_audiomixer.get((args && args.settings) ? args.settings : null));
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Sets one or more audio parameters
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		fade: {Number},
	 *		balance: {Number},
	 *		bass: {Number},
	 *		mid: {Number},
	 *		treble: {Number},
	 *		[...]
	 *	}
	 * @param env {Object} Environment variables
	 */
	set: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_audiomixer.set(args);
			success();
		} catch (e) {
			fail(-1, e);
		}
	}
};

