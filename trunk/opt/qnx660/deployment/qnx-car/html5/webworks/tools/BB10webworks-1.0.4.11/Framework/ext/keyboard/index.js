/**
* Provides access to the keyboard
 *
 * @author mlapierre
 * $Id: index.js 4348 2012-09-28 18:05:29Z mlytvynyuk@qnx.com $
 */

var _wwfix = require("../../lib/wwfix"),
	_event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
	_actionMap = {
		/**
		 * @event
		 * Triggered when the keyboard is changed
		 * Ex {
		 *	 visible:{Boolean} 		// indicates that keyboard is visible.
		 * }
		 */
		keyboardevent: {
			context: require("./context"),
			event: "keyboardevent",
			trigger: function (args) {
				_event.trigger("keyboardevent", args);
			}
		},
	},
	_keyboard = require("./keyboard");

/**
 * Initializes the extension 
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
		_keyboard.init();
	} catch (ex) {
		console.error('Error in webworks ext: keyboard/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * SHows the keyboard
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	show: function(success, fail, args, env) {
		try {
			success(_keyboard.show());
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Hides the keyboard
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	hide: function(success, fail, args, env) {
		try {
			_keyboard.hide();
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Returns the state of the keyboard
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getState: function(success, fail, args, env) {
		try {
			success(_keyboard.getState());
		} catch (e) {
			fail(-1, e);
		}
	},
};

