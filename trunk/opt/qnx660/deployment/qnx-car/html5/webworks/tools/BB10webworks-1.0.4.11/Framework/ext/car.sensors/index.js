/**
 * Implementation for car.sensors API
 *
 * @author mlapierre
 * $Id: index.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _wwfix = require("../../lib/wwfix"),
	_event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
	_sensors = require("./sensors"),
	_actionMap = {},
	Event = require("./enum/Event");


// Fill out the action map
_actionMap[Event.UPDATE] = {
	context: require("./context"),
	event: Event.UPDATE,
	trigger: function (args) {
		_event.trigger(Event.UPDATE, args);
	}
};


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
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	get: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			var result = _sensors.get((args.sensors) ? args.sensors.split(',') : null);
			success(result);
		} catch (e) {
			fail(-1, e);
		}
	},
};

 