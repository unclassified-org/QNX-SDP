/**
 * @module qnx_xyz_audiomixer
 * 
 * @description Control the audio mixer settings
 * @deprecated Please use car.audiomixer instead
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
	 * Return the current audio parameters
	 * @param {Array} settings A list of settings to get [optional]; all settings are returned if the parameter is omitted
	 * @returns {Object} The requested settings
	 * @example
	 *{
	 *     fade: {Number},
	 *     balance: {Number},
	 *     bass: {Number},
	 *     mid: {Number},
	 *     treble: {Number},
	 *}   
	 */
	get: function (settings) {
		if (settings) {
		    return window.webworks.execSync(_ID, 'get', { settings: settings });
		} else {
		    return window.webworks.execSync(_ID, 'get');
		}
	},
	
	/**
	 * Set one or more audio parameters
	 * @param  {Object} args The audio parameters to set
	 * @example
	 *{
	 *     fade: {Number},
	 *     balance: {Number},
	 *     bass: {Number},
	 *     mid: {Number},
	 *     treble: {Number},
	 *}	
	 */
	set: function (args) {
	    window.webworks.execSync(_ID, 'set', args);
	},	
};