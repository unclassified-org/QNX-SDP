/**
 * Sends pause, resume and reselect events to an application
 *
 * @author dkerr
 * $Id: index.js 4435 2012-09-29 17:49:54Z mlapierre@qnx.com $
 */

var _wwfix = require("../../lib/wwfix"),
	_event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
	_actionMap = {
		/**
		 * @event
		 * Triggered when pps is written 
		 */
		pause: {
			context: require("./context"),
			event: "pause",
			trigger: function (args) {
				_event.trigger("pause", args);
			}
		},
		resume: {
			context: require("./context"),
			event: "resume",
			trigger: function (args) {
				_event.trigger("resume", args);
			}
		},
		reselect: {
			context: require("./context"),
			event: "reselect",
			trigger: function (args) {
				_event.trigger("reselect", args);
			}
		},
		appdata: {
			context: require("./context"),
			event: "appdata",
			trigger: function (args) {
				_event.trigger("appdata", args);
			}
		}
	},
	_application = require("./application");

/**
 * Initializes the extension
 * Note: _application.init can't be called here.  
 * There may be a jscreen init issue.
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
	} catch (ex) {
		console.error('Error in webworks ext: application.event/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {

	/**
	 * Register's the application name for filtering the events.  Also writes the screen window group name.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: key - the application name
	 * @param env {Object} Environment variables
	 */
	register: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_application.register(args.key);
			success();
		} catch (e) {
			fail(-1, 'fail ' + e);
		}
	},
	
	/**
	 * Gets the screen window group.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: n/a
	 * @param env {Object} Environment variables
	 */
	getWindowGroup: function(success, fail, args, env) {
		try {
			success(_application.getWindowGroup());
		} catch (e) {
			fail(-1, 'fail ' + e);
		}
	},

	/**
	 * Gets the data passed to the application on startup
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getData: function(success, fail, args, env) {
		try {
			success(_application.getData());
		} catch (e) {
			fail(-1, 'fail ' + e);
		}
	},
};

