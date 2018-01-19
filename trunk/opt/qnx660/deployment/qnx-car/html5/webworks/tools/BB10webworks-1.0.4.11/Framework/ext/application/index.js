/**
 * Returns list of installed applications, requests to launch an application
 * Listens for installed/uninstalled/started/stopped applications
 *
 * @author nschultz
 * $Id: index.js 4545 2012-10-09 15:55:06Z dkerr@qnx.com $
 */

var _wwfix = require("../../lib/wwfix"),
	_event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
	_actionMap = {
		/**
		* @event
		* Triggered when an application is installed 
		*/
		installed: {
			context: require("./context"),
			event: "installed",
			trigger: function (args) {
				_event.trigger("installed", args);
			}
		},
		/**
		* @event
		* Triggered when an application is uninstalled 
		*/
		uninstalled: {
			context: require("./context"),
			event: "uninstalled",
			trigger: function (args) {
				_event.trigger("uninstalled", args);
			}
		},
		/**
		* @event
		* Triggered when an application is started 
		*/
		started: {
			context: require("./context"),
			event: "started",
			trigger: function (args) {
				_event.trigger("started", args);
			}
		},
		/**
		* @event
		* Triggered when an application is stopped 
		*/
		stopped: {
			context: require("./context"),
			event: "stopped",
			trigger: function (args) {
				_event.trigger("stopped", args);
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
		_application.init();
	} catch (ex) {
		console.error('Error in webworks ext: application/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	* Gets the list of applications.
	* @param success {Function} Function to call if the operation is a success
	* @param fail {Function} Function to call if the operation fails
	* @param args {Object} The arguments supplied. Available arguments for this call are: n/a
	* @param env {Object} Environment variables
	*/
	getList: function (success, fail, args, env) {
		try {
			success(_application.getList());
		} catch (e) {
			fail(-1, 'fail ' + e);
		}
	},

	/**
	* Finds the installed ID of a specific application by its user-defined id
	* @param success {Function} Function to call if the operation is a success
	* @param fail {Function} Function to call if the operation fails
	* @param args {Object} The arguments supplied. Available arguments for this call are: 
	* Ex. {
	*		id: {String}, // the user-defined id
	* }
	* @param env {Object} Environment variables
	*/
	find: function (success, fail, args, env) {
		try {
			localArgs = _wwfix.parseArgs(args);
			success(_application.find(localArgs.id));
		} catch (e) {
			fail(-1, 'fail ' + e);
		}
	},

	/**
	* Creates a request to start an application
	* @param success {Function} Function to call if the operation is a success
	* @param fail {Function} Function to call if the operation fails
	* @param args {Object} The arguments supplied. Available arguments for this call are: 
	*	{
	*		id: {String},
	*	}
	* @param env {Object} Environment variables
	*/

	start: function (success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(_application.start(args.id, args.data));
		} catch (e) {
			fail(-1, 'fail ' + e);
		}
	},

	/**
	* Creates a request to stop an application
	* @param success {Function} Function to call if the operation is a success
	* @param fail {Function} Function to call if the operation fails
	* @param args {Object} The arguments supplied. Available arguments for this call are: 
	*	{
	*		id: {String},
	*	}
	* @param env {Object} Environment variables
	*/
	stop: function (success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(_application.stop(args.id));
		} catch (e) {
			fail(-1, 'fail ' + e);
		}
	}
};