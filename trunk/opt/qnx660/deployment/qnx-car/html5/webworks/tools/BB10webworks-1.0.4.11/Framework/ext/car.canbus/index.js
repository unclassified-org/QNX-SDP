/**
 * Allows control of volume and other audio parameters
 *
 * @author mlapierre
 * $Id: index.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _wwfix = require("../../lib/wwfix"),
	_event = require("../../lib/event"),
	_utils = require("./../../lib/utils");
	// _canbus = require("./canbus");

/**
 * Initializes the extension 
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
		// _canbus.init();
	} catch (ex) {
		console.error('Error in webworks ext: canbus/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Reads the values from the CAN bus for the specified parameters
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	read: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			//var result = _canbus.read(args.mode, args.pid);
			success(/*result*/);
		} catch (e) {
			fail(-1, e);
		}
	},
};

