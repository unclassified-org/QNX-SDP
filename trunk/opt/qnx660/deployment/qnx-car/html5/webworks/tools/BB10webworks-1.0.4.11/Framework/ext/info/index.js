/**
 * Allows the user to read system information
 *
 * @author mlapierre
 * $Id: index.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _info = require("./info");

/**
 * Initializes the extension 
 */
function init() {
	try {
		_info.init();
	} catch (ex) {
		console.error('Error in webworks ext: info/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Returns the current system information
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	get: function(success, fail, args, env) {
		try {
			success(_info.get());
		} catch (e) {
			fail(-1, e);
		}
	},
};

