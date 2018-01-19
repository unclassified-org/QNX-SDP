/**
* Allows access to media sources
 *
 * @author mlapierre
 * $Id: index.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
	_actionMap = {
		/**
		 * @event
		 * Triggered when the mediasource is updated
		 */
		mediasourceupdate: {
			context: require("./context"),
			event: "mediasourceupdate",
			trigger: function (args) {
				_event.trigger("mediasourceupdate", args);
			}
		},
		/**
		 * @event
		 * Triggered when the mediasource is started
		 */
		mediasourceadded: {
			context: require("./context"),
			event: "mediasourceadded",
			trigger: function (args) {
				_event.trigger("mediasourceadded", args);
			}
		},
		/**
		 * @event
		 * Triggered when the mediasource is stopped
		 */
		mediasourceremoved: {
			context: require("./context"),
			event: "mediasourceremoved",
			trigger: function (args) {
				_event.trigger("mediasourceremoved", args);
			}
		}
	},
	_mediasource = require("./mediasource");

/**
 * Initializes the extension 
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
		_mediasource.init();
	} catch (ex) {
		console.error('Error in webworks ext: mediasource/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Returns an array of media sources
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	get: function (success, fail, args, env) {
		try {
			success(_mediasource.get());
		} catch (e) {
			fail(-1, e);
		}
	},
};

