/**
 * @module qnx_xyz_hvac
 * @description Control the HVAC system 
 *
 * @deprecated Please use car.hvac instead
 */
 
/* @author mlapierre
 * $Id: client.js 4326 2012-09-27 17:43:24Z mlapierre@qnx.com $
 */

var _ID = require("./manifest.json").namespace;

/*
 * Exports are the publicly accessible functions
 */
module.exports = {	
	/**
	 * Return the HVAC settings
	 * @param {Array} settings A list of settings to get [optional]; if this parameter is omitted, all settings are returned 
	 * @returns {Object} The requested settings
	 * @example
	 *{
	 *     airCirculation_setting: {Boolean},
	 *     airConditioning_enabled: {Boolean},
	 *     fan_setting_l: {Number},
	 *     [...]
	 *}
	 *NOTE: the list of settings is not fixed and depends on your system configuration
	 */
	get: function (settings) {
		if (settings) {
		    return window.webworks.execSync(_ID, 'get', { settings: settings });
		} else {
		    return window.webworks.execSync(_ID, 'get');
		}
	},
	
	/**
	 * Set one or more HVAC settings
	 * @param {Object} args The HVAC settings to set
	 * @example
	 *{
	 *     fan_setting_l: {Number},
	 *     fan_setting_r: {Number},
	 *     [...]
	 *}
	 *NOTE: the list of settings is not fixed and depends on your system configuration
	 */
	set: function (args) {
		//encode to preserve types
	    window.webworks.execSync(_ID, 'set', args);
	},	
};
