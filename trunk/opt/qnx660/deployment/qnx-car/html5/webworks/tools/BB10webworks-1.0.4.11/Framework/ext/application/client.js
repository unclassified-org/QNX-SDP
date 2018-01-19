/**
 * @module qnx_xyz_application
 * @description Return the list of applications, or to start or stop an application
 */

/* @author nschultz
 * $Id$
 */

var _ID = require("./manifest.json").namespace;

/*
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Return the list of applications
	 * @return {Object} A collection of the installed application objects
	 * @example 
	 *{
	 *     key: {String} {
	 *     name: {String}, 
	 *     group: {String},
	 *     id: {String},
	 *     uri: {String},
	 *     icon: {String},
	 *     },
	 * [...]
	 *}
	 */
	getList: function () {
		return window.webworks.execSync(_ID, 'getList');
	},
	
	/**
	 * Find the installed ID of a specific application by its user defined ID
	 * @param {String} id The ID of the application to start
	 * @return {String} The installed ID 
	 */
	find: function(id) {
		return window.webworks.execSync(_ID, 'find', {id: id});
	},
    /**
	 * Create a request to start an application
	 * @param  {String} id The ID of the application to start
	 * @param  {Object} data The startup data for the application
	 */
	start: function (id, data) {
		if (!data || data === undefined) {
			data = "";
		}
		window.webworks.execSync(_ID, 'start', {id: id, data: data});
	},

	/**
	 * Create a request to stop an application
	 * @param {String} id The ID of the application to stop
	 */
	stop: function (id) {
		window.webworks.execSync(_ID, 'stop', {id: id});
	}
};