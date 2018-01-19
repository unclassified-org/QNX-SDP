/**
 * @module qnx_xyz_volume
 * @description Allow control of the volume 
 *
 * @deprecated Please use car.audiomixer instead.
 */

/* 
 * @author mlapierre
 * $Id: client.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _ID = require("./manifest.json").namespace;

/*
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Return the current volume
	 * @return {Number} The current audio parameters
	 */
	get: function () {
	    return window.webworks.execSync(_ID, 'get');
	},
	
	/**
	 * Set the volume
	 * @param {Number} volume The new volume to set
	 */
	set: function (volume) {
	    window.webworks.execSync(_ID, 'set', { volume: volume });
	},	
};