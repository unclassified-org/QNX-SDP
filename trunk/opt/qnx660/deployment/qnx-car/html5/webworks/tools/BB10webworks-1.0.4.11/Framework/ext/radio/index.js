/**
 * Allows control of radio tuners, presets, and stations.
 *
 * @author lgreenway
 * $Id: index.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _wwfix = require("../../lib/wwfix"),
	_event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
	_actionMap = {
		/**
		 * @event
		 * Triggered when the radio metadata has changed
		 */
		radiometadatachanged: {
			context: require("./context"),
			event: "radiometadatachanged",
			trigger: function (args) {
				_event.trigger("radiometadatachanged", args);
			}
		},
		/**
		 * @event
		 * Triggered when one or more tuner presets have changed
		 */
		radiopresetschanged: {
			context: require("./context"),
			event: "radiopresetschanged",
			trigger: function (args) {
				_event.trigger("radiopresetschanged", args);
			}
		},
		/**
		 * @event
		 * Triggered when the active tuner has changed
		 */
		radiotunerchanged: {
			context: require("./context"),
			event: "radiotunerchanged",
			trigger: function (args) {
				_event.trigger("radiotunerchanged", args);
			}
		},
		/**
		 * @event
		 * Triggered when a tuner station has changed. This can be for the active tuner
		 * or another configured tuner.
		 */
		radiostationchanged: {
			context: require("./context"),
			event: "radiostationchanged",
			trigger: function (args) {
				_event.trigger("radiostationchanged", args);
			}
		},
	},
	_radio = require("./radio");

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
			success(_radio.getTuners());
		} catch (e) {
			fail(-1, e);
		}
	},
				
	/**
	 * Gets the active tuner name.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getActiveTuner: function(success, fail, args, env) {
		try {
			success(_radio.getActiveTuner());
		} catch (e) {
			fail(-1, e);
		}
	},
			
	/**
	 * Sets the active tuner by name.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		tuner: {String}, // the tuner to set as active
	 *	}
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
	 * Gets the current station for the active tuner. Optionally, if a tuner name is specified,
	 * returns the current station for the specified tuner.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		tuner: {String}, // (optional) the target tuner
	 *	}
	 * @param env {Object} Environment variables
	 */
	getStation: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(_radio.getStation(args.tuner || undefined));
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
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		station: {Number}, // the target station
	 *		tuner: {String}, // (optional) the target tuner
	 *	}
	 * @param env {Object} Environment variables
	 */
	setStation: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_radio.setStation(args.station, args.tuner || undefined);
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
			success(_radio.getPresets(args.tuner || undefined));
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Sets the entire list of presets for the specified tuner(s).
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		presets: {Object}, // the object with tuner preset attribute/array pairs
	 *	}
	 * @param env {Object} Environment variables
	 */
	setPresets: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_radio.setPresets(args.presets);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Sets the current station as a preset at the specified index. A station and tuner can optionally
	 * be specified to set the non-current station as a preset, and/or for the non-active tuner. 
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		index: {Number}, // the index where we want to save the preset
	 *		station: {Number}, // (optional) the station to set as the preset, if not the current
	 *		tuner: {Number}, // (optional) the target tuner, if not the active
	 *	}
	 * @param env {Object} Environment variables
	 */
	setPreset: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_radio.setPreset(args.index, args.station || undefined, args.tuner || undefined);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Seek for the next radio station in the given direction
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		direction: {String}, //the direction to seek ('up' or 'down')
	 *	}
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
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		direction: {String}, //the direction to scan ('up' or 'down')
	 *	}
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
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
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
	getMetadata: function(success, fail, args, env) {
		try {
			success(_radio.getMetadata());
		} catch (e) {
			fail(-1, e);
		}
	},
};

