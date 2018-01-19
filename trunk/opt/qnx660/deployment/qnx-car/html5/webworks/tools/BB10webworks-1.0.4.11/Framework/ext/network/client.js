/**
 * @module qnx_xyz_network
 * @description Allow access to network resources 
 *
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
	 * Return an array of available network interfaces
	 * @returns {Array} The array of available network interfaces
	 * @example
	 *{
	 *     dhcp: {Boolean},
	 *     ip: {String},
	 *     netmask: {String},
	 *     gateway: {String},	
	 *}
	 */
	getInterfaces: function () {
	    return window.webworks.execSync(_ID, 'getInterfaces');
	},
	
	/**
	 * Confgure network interface parameters
	 * @param {String} id The ID of a network interface as returned by get()
	 * @param {Object} params A collection of parameters to set
	 * @example 
	 *{
	 *     dhcp: {Boolean},
	 *     ip: {String},
	 *     netmask: {String},
	 *     gateway: {String},
	 *}
	 */
	configureInterface: function (id, params) {
	    window.webworks.execSync(_ID, 'configureInterface', { id: id, params: params });
	},	
};