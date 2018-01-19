/**
 * Allows control of volume and other audio parameters
 *
 * @author mlapierre
 * $Id: index.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _wwfix = require("../../lib/wwfix"),
	_event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
	_actionMap = {
		/**
		 * @event
		 * Triggered when the volume is updated
		 */
		volumeupdate: {
			context: require("./context"),
			event: "volumeupdate",
			trigger: function (args) {
				_event.trigger("volumeupdate", args);
			}
		}
	},
	_volume = require("./volume");

/**
 * Initializes the extension 
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
		_volume.init();
	} catch (ex) {
		console.error('Error in webworks ext: volume/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Returns the current volume
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	get: function(success, fail, args, env) {
		try {
			success(_volume.get());
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Sets the volume
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		volume: {Number}, //the new volume to set
	 *	}
	 * @param env {Object} Environment variables
	 */
	set: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_volume.set(args.volume);
			success();
		} catch (e) {
			fail(-1, e);
		}
	}
};

