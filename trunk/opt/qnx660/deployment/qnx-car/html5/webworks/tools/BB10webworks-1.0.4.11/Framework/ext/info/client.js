/**
 * @module qnx_xyz_info
 * @description Read system information 
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
	 * Return the current system information
	 * @returns {Object} The system information
	 * @example
	 *{
	 *     buildHost: {String}, 
	 *     buildID: {String}
	 *     buildNum: {String}
	 *     car2branch: {String}
	 *     car2rev: {String}
	 *     platform: {String}
	 *     runtimeExt_revision: {String}
	 *     runtimeExt_url: {String}
	 *     variant: {String}
	 *}
	 *NOTE: the list of settings is not fixed and depends on your system configuration
	 */
	get: function () {
		   return window.webworks.execSync(_ID, 'get');
	}
}