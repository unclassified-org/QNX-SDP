/**
 * Allows the user to read vehicle sensors
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
		 * Triggered when one of the sensors is updated
		 */
		sensorsupdate: {
			context: require("./context"),
			event: "sensorsupdate",
			trigger: function (args) {
				_event.trigger("sensorsupdate", args);
			}
		},
	},
	_sensors = require("./sensors");

/**
 * Initializes the extension 
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
		_sensors.init();
	} catch (ex) {
		console.error('Error in webworks ext: sensors/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Returns the current vehicle sensors
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		*: {Mixed},	//the arguments for this function are dynamic and could be anything
	 *		[...]
	 *	}
	 * @param env {Object} Environment variables
	 */
	get: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(_sensors.get((args && args.sensors) ? args.sensors : null));
		} catch (e) {
			fail(-1, e);
		}
	},
};

