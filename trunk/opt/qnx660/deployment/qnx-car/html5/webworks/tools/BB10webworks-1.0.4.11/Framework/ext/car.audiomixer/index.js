/**
 * Allows control of volume and other audio parameters
 *
 * @author mlapierre
 * $Id: index.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _wwfix = require("../../lib/wwfix"),
	_event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
	_audiomixer = require("./audiomixer"),
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

/**
 * Initializes the extension 
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
		_audiomixer.init();
	} catch (ex) {
		console.error('Error in webworks ext: audiomixer/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Returns the current audio parameters
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	get: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			var settings = (args.settings) ? args.settings.split(',') : null;
			var result = _audiomixer.get(settings);
			success(result);
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Sets one or more audio parameters
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	set: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_audiomixer.set(args.setting, args.zone, args.value);
			success();
		} catch (e) {
			fail(-1, e);
		}
	}
};

