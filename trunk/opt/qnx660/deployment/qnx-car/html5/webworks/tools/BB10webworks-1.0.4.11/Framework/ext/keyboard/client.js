/**
 * @module qnx_xyz_keyboard 
 * @description Provide access to the keyboard
 *
 */
 
/* @author mlapierre
 * $Id: client.js 4348 2012-09-28 18:05:29Z mlytvynyuk@qnx.com $
 */

var _ID = require("./manifest.json").namespace;

/*
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Show the keyboard
	 */
	show: function() {
		window.webworks.execSync(_ID, 'show');
	},
	
	/**
	 * Hide the keyboard
	 */
	hide: function() {
		window.webworks.execSync(_ID, 'hide');
	},
	
	/**
	 * Return the state of the keyboard
	 * @returns {Object} The state of the keyboard
	 * @example
	 * visible: {Boolean}	// true if keyboard visible
	 */
	getState: function() {
		window.webworks.execSync(_ID, 'getState');
	},	
};
