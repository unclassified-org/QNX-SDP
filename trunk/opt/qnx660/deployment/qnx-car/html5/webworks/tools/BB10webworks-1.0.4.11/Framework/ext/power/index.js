/**
 * @author mlytvynyuk
 * $Id: index.js 5052 2012-11-15 22:17:23Z mlapierre@qnx.com $
 */

var _wwfix = require("../../lib/wwfix"),
	_event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
	_power = require("./power");

/**
 * Initializes the extension 
 */
function init() {
	try {
		_power.init();
	} catch (ex) {
		console.error('Error in webworks ext: power/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {

	/**
	 * shutdowns the system
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 * {
	 *	 reason:"user requested",
	 *	 fast:1
	 * }
	 * @param env {Object} Environment variables
	 */
	shutdown: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_power.shutdown(args.reason,args.fast);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * reboots the system
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 * {
	 *	 reason:"user requested",
	 *	 fast:1
	 * }
	 * @param env {Object} Environment variables
	 */
	reboot: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_power.reboot(args.reason,args.fast);
			success();
		} catch (e) {
			fail(-1, e);
		}
	}
};

