/**
 * Manages theming
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
		 * Triggered when the theme is changed
		 */
		themeupdate: {
			context: require("./context"),
			event: "themeupdate",
			trigger: function (args) {
				_event.trigger("themeupdate", args);
			}
		},
	},
	_theme = require("./theme");

/**
 * Initializes the extension 
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
		_theme.init();
	} catch (ex) {
		console.error('Error in webworks ext: theme/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Returns a list of available themes
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getList: function(success, fail, args, env) {
		try {
			success(_theme.getList());
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Returns the current theme
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getActive: function(success, fail, args, env) {
		try {
			success(_theme.getActive());
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Sets the current theme
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 * {
	 * 		theme: {String}	//the name of the theme
	 * }
	 * @param env {Object} Environment variables
	 */
	setActive: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_theme.setActive(args.theme);
			success();
		} catch (e) {
			fail(-1, e);
		}
	}
};
