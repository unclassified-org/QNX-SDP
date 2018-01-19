/**
 * Allows control of HVAC systems 
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
		hvacupdate: {
			context: require("./context"),
			event: "hvacupdate",
			trigger: function (args) {
				_event.trigger("hvacupdate", args);
			}
		},
	},
	_hvac = require("./hvac");

/**
 * Initializes the extension 
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
		_hvac.init();
	} catch (ex) {
		console.error('Error in webworks ext: hvac/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Returns HVAC settings
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
			success(_hvac.get((args && args.settings) ? args.settings : null));
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Sets one or more HVAC settings
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		*: {Mixed},	//the arguments for this function are dynamic and could be anything
	 *		[...]
	 *	}
	 * @param env {Object} Environment variables
	 */
	set: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_hvac.set(args);
			success();
		} catch (e) {
			fail(-1, e);
		}
	}
};

