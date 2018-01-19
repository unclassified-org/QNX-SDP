/**
 * @module qnx_xyz_mediasource
 *
 * @description Allow access to media sources
 *
 * @deprecated Please use car.mediaplayer instead.
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
	 * Return an array of media sources
	 * @return {Array} An array of media source objects
	 * @example
	 *{
	 *     id: {String},
	 *     name: {String},	
	 *     fs: {String},
	 *     type: {String},	
	 *     synched: {Boolean},	
	 *     mount: {String},
	 *     db: {String},
	 *     imagepath: {String}
	 *}
	 */
	get: function () {
		return window.webworks.execSync(_ID, 'get');
	},
};
