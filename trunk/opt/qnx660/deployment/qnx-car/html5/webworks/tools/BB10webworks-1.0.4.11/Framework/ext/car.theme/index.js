/**
 * Manages theming
 *
 * @author mlapierre
 * $Id: index.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _wwfix = require("../../lib/wwfix"),
	_event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
	_theme = require("./theme"),
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
	 * @param args {Object} The arguments supplied.
	 * @param env {Object} Environment variables
	 */
	getList: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			var result = _theme.getList();
			success(result);
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Returns the current theme
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	getActive: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			var result = _theme.getActive();
			success(result);
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Sets the current theme
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	setActive: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_theme.setActive(args.themeId);
			success();
		} catch (e) {
			fail(-1, e);
		}
	}
};
