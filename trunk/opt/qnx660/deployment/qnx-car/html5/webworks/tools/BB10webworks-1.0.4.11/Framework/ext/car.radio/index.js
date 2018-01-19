/**
 * Allows control of radio tuners, presets, and stations.
 *
 * @author lgreenway
 * $Id: index.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _wwfix = require("../../lib/wwfix"),
	_event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
	_radio = require("./radio"),
	_actionMap = {},
	Event = require("./enum/Event");


// Fill out the action map
_actionMap[Event.UPDATE] = {
	context: require("./context"),
	event: Event.UPDATE,
	trigger: function (args) {	
		_event.trigger(Event.UPDATE, args);
	}
};
_actionMap[Event.PRESETS] = {
	context: require("./context"),
	event: Event.PRESETS,
	trigger: function (args) {	
		_event.trigger(Event.PRESETS, args);
	}
};


/**
 * Initializes the extension 
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
		_radio.init();
	} catch (ex) {
		console.error('Error in webworks ext: radio/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Returns the list of available tuners.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getTuners: function(success, fail, args, env) {
		try {
			var result = _radio.getTuners();
			success(result);
		} catch (e) {
			fail(-1, e);
		}
	},
			
	/**
	 * Sets the active tuner by name.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	setTuner: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_radio.setTuner(args.tuner);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Tune to a specific station, optionally targeting a specific tuner. If the specified
	 * tuner is not the active tuner, then the station will be automatically selected the next
	 * time that tuner is set as active.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	setStation: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			var tuner = (typeof args.tuner !== 'undefined') ? args.tuner : _radio.getStatus().tuner
			_radio.setStation(args.station, tuner);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Get the presets for the current tuner. Optionally, a tuner name can be specified, returning
	 * presets for the specified tuner.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		tuner: {String}, // (optional) the target tuner
	 *	}
	 * @param env {Object} Environment variables
	 */
	getPresets: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			var tuner = (typeof args.tuner !== 'undefined') ? args.tuner : _radio.getStatus().tuner
			success(_radio.getPresets(tuner));
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Sets the entire list of presets for the specified tuner(s).
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	setPreset: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			var tuner = (typeof args.tuner !== 'undefined') ? args.tuner : _radio.getStatus().tuner
			var station = (typeof args.station !== 'undefined') ? args.station : _radio.getStatus().station
			_radio.setPreset(args.index, args.group, station, tuner);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Seek for the next radio station in the given direction
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	seek: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_radio.seek(args.direction);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Scan for available radio stations in the given direction
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	scan: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_radio.scan(args.direction);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Stop scanning
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	scanStop: function(success, fail, args, env) {
		try {
			_radio.scanStop();
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Get the current station metadata.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getStatus: function(success, fail, args, env) {
		try {
			var result = _radio.getStatus();
			success(result);
		} catch (e) {
			fail(-1, e);
		}
	},
};

