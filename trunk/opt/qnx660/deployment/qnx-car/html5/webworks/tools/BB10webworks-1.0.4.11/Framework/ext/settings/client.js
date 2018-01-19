/**
 * @module qnx_xyz_settings
 * @description Allow control of system settings
 */
 
/*
 * @author mlapierre
 * $Id: client.js 4326 2012-09-27 17:43:24Z mlapierre@qnx.com $
 */

var _ID = require("./manifest.json").namespace;

/*
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Return system settings
	 * @param {Array} settings A list of settings to get [optional]; if omitted, all settings are returned
	 * @returns {Object} The requested settings.
	 * NOTE: the list of settings is not fixed and depends on your system configuration
	 */
	get: function (settings) {
		if (settings) {
		    return window.webworks.execSync(_ID, 'get', { settings: settings });
		} else {
		    return window.webworks.execSync(_ID, 'get');
		}
	},
	
	/**
	 * Set one or more system settings
	 * @param {Object} args The system settings to set. 
	 * NOTE: the list of settings is not fixed and depends on your system configuration
	 */
	set: function (args) {
		//encode to preserve types
	    window.webworks.execSync(_ID, 'set', args);
	},	
};
