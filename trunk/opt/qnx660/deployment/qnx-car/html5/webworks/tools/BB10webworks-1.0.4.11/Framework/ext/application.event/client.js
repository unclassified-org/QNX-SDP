/**
 *@module qnx_xyz_application_xyz_event
 *
 * @description Send events to an application, as well as to pause, resume, and reselect events 
 */
 
/*
 * @author dkerr
 * $Id: client.js 4582 2012-10-11 19:59:26Z mlapierre@qnx.com $
 */

var _ID = require("./manifest.json").namespace;

/*
 * Exports are the publicly accessible functions
 */
module.exports = {

	/**
	 * Register the key (application name) for pause, resume, and reselect events
	 * @param {String} key The application key
	 */
	register: function(key) {
		window.webworks.execSync(_ID, 'register', { key: key });
	},
	
	/**
	 * Get the screen window group name for the specified key
	 * @param {String} key The application key
	 */
	getWindowGroup: function(key) {
		return window.webworks.execSync(_ID, 'getWindowGroup' );
	},

	/**
	 * Get the data passed to the application on startup
	 * @return {Mixed} The data passed to the application on startup, or null
	 */
	getData: function() {
		return window.webworks.execSync(_ID, 'getData' );
	},
};

