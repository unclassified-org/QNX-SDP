/**
 * @module qnx_xyz_radio
 * @description Allow control of radio tuners, presets, and stations
 * 
 * @deprecated Please use car.radio instead.
 */

/* @author lgreenway
 * $Id: client.js 4326 2012-09-27 17:43:24Z mlapierre@qnx.com $
 */

var _ID = require("./manifest.json").namespace;

/*
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Return the list of available tuners
	 * @return {Object} An object containing attributes corresponding to each tuner object. The attribute name
	 * is the name of the tuner.
	 * @example
	 *{
	 *{String}:    {               //tuner name, e.g. 'am'
	 *     type: {String},         //type of tuner, e.g. 'analog'
	 *     rangeMin: {Number},     //the minimum frequency of the tuner, e.g. 880
	 *     rangeMax: {Number},     //the maximum frequency of teh tuner, e.g. 1710
	 *     rangeStep: {Number},    //the step between tuner frequencies 10
	 *             },
	 *}
	 */
	getTuners: function() {
		return window.webworks.execSync(_ID, 'getTuners');
	},
		
	/**
	 * Get the active tuner name. NOTE: if you require more details about the tuner,
	 * use the getTuners method to get detailed information.
	 * @return {String} The active tuner name
	 */	
	getActiveTuner: function() {
		return window.webworks.execSync(_ID, 'getActiveTuner');
	},
		
	/**
	 * Set the active tuner by name
	 * @param {String} tuner The name of tuner to set as active
	 */
	setTuner: function(tuner) {
		window.webworks.execAsync(_ID, 'setTuner', { tuner: tuner });
	},
	
	/**
	 * Get the current station for the active tuner
	 * @param {String} tuner  The station tune name [optional]; if not specified, the current station for the active tuner is returned
	 * @returns {Number} The current station
	 */
	getStation: function(tuner) {
		return window.webworks.execSync(_ID, 'getStation', tuner ? { tuner: tuner } : {});
	},
	
	/**
	 * Tune to a specific station, optionally targeting a specific tuner. If the specified
	 * tuner is not the active tuner, then the station will be automatically selected the next
	 * time that tuner is set as active.
	 * @param {Number} station The target station
	 * @param {String} tuner  The target tuner name [optional]; if not specified, the active tuner is used
	 */
	setStation: function(station, tuner) {
		var args = { station: station };
		if(tuner) {
			args["tuner"] = tuner;
		}
		window.webworks.execAsync(_ID, 'setStation', args);
	},
	
	/**
	 * Get the presets for the current tuner. Optionally, a tuner name can be specified, returning
	 * presets for the specified tuner.
	 * @param {String} tuner The tuner of the presets [optional]; if not specified, the active tuner is used
	 * @return {Object} An object containing an attribute corresponding to the tuner name
	 * with its associated preset list
	 * @example
	 *{
	 *     {String}:        //tuner name .e.g.: 'am'
	 *     {Array}:         //Array of stations e.g.: [1200, 1210, 1340, 1400, 1400, 1500],
	 *}
	 */
	getPresets: function(tuner) {
	    return window.webworks.execSync(_ID, 'getPresets', tuner ? { tuner: tuner } : {});
	},
	
	/**
	 * Set the entire list of presets for the specified tuner(s)
	 * @param {Object} presets An object containing one or more tuner preset lists
	 * @example
	 *{
	 *{String}:                    //tuner name. e.g.: 'am'
	 *     {Array}:                //Array of stations. Ex: [1200, 1210, 1340, 1400, 1400, 1500],
	 *{String}:                    //tuner name. e.g.: 'fm'
	 *     {Array}                 //Array of stations. Ex: [87.9, 91.5, 95.1, 103.4, 105.1, 107.1],
	 *}
	 */
	setPresets: function(presets) {
		window.webworks.execAsync(_ID, 'setPresets', { presets: presets });
	},
	
	/**
	 * Set the current station as a preset at the specified index. You can optionally specify a different station and tuner as a preset. 
	 * @param {Number} index The preset index
	 * @param {Number} station The station to set as the preset [optional]; if this is not specified, the current station is used
	 * @param {String} tuner  The station's tuner [optional]; if not specified, the active tuner is used
	 */
	setPreset: function(index, station, tuner) {
		var args = { index: index };
		if(station) {
			args["station"] = station;
		}
		if(tuner) {
			args["tuner"] = tuner;
		}
		window.webworks.execAsync(_ID, 'setPreset', args);
	},
	
	/**
	 * Call this method to seek for the next radio station in the given direction
	 * @param {String} direction The direction to seek ('up' or 'down')
	 */
	seek: function(direction) {
	    window.webworks.execAsync(_ID, 'seek', { direction: direction });
	},
	
	/**
	 * Call this method to scan for available radio stations in the given direction
	 * @param {String} direction The direction to seek ('up' or 'down')
	 */
	scan: function(direction) {
	    window.webworks.execAsync(_ID, 'scan', { direction: direction });
	},
	
	/**
	 * Stop station scanning if in progress
	 */
	scanStop: function() {
	    window.webworks.execAsync(_ID, 'scanStop');
	},
	
	/**
	 * Get the current station metadata
	 * @return {Object} A station metadata object
	 * @example
	 *{
	 *     tuner: {String},         //tuner name, e.g. 'fm'
	 *     station: {Number},       //current station, e.g. 91.5
	 *     artist: {String},        //current artist, e.g. 'Bjork'
	 *     genre: {String},         //current genre, e.g. 'News & Entertainment'
	 *     song: {String},          //current song title, e.g. 'All is Full of Love'
	 *     stationName: {String},   //current station name, e.g. 'CBC Radio 1'
	 *     hd: {Boolean},           //true if station is HD, otherwise false
	 *}
	 */
	getMetadata: function() {
		return window.webworks.execSync(_ID, 'getMetadata');
	}
};
