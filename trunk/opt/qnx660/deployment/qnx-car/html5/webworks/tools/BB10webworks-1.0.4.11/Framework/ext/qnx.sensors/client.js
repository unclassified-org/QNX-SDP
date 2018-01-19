/**
 * @module qnx_xyz_sensors
 * @description Allow the user to read vehicle sensors 
 *
 * @deprecated Please use car.sensors instead.
 */

/* @author mlapierre
 * $Id: client.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _ID = require("./manifest.json").namespace;

/*
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Return the current vehicle sensors
	 * @param {Array} sensors A list of sensors to get [optional]; if omitted, all sensors are returned
	 * @returns {Object} The requested vehicle sensors
	 * @example
	 *{
	 *     speed: 0,
	 *     tire_pressure_fl: 31,
	 *     tire_pressure_fr: 31,
	 *     [...]
	 *}
	 */
	get: function (sensors) {
		if (sensors) {
		    return window.webworks.execSync(_ID, 'get', { sensors: sensors });
		} else {
		    return window.webworks.execSync(_ID, 'get');
		}
	},
}