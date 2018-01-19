/**
 * Defines control of Software Update operations and events
 *
 * @author mlytvynyuk
 * $Id: index.js 4410 2012-09-29 13:47:59Z mlytvynyuk@qnx.com $
 */

var _wwfix = require("../../lib/wwfix"),
	_event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
	_actionMap = {
		/**
		 * @event Fired in case there is an update available
		 * Ex:
		 * 	{
		 *		 updateAvailable:{Boolean},				//indicated if update is available or not. If updateAvailable:false, the <code>updateDetails</code> field will not be populated
		 *		 updateDetails: {
		 *			 "sourceVersion":{String},			// source version of the software update
		 *			 "targetVersion":{String},			// target version of the software update
		 *			 "source":{Number}					// indicates the source of the update
		 *		 },
				updateError:{String}					// Send messages about errors that occur to print on HMI [Optional]
		 * 	}
		 */
		systemupdateavailable:{
			context:require("./context"),
			event:"systemupdateavailable",
			trigger:function (args) {
				_event.trigger("systemupdateavailable", args);
			}
		}
	},
	_updates = require("./systemupdate.js");

/**
 * Initializes the extension
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
		_updates.init();
	} catch (ex) {
		console.error('Error in webworks ext: systemupdate/index.js:init():', ex);
	}
}

init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Sends command to updateMgr to check if update available
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	checkForUpdate:function (success, fail, args, env) {
		try {
			_updates.checkForUpdate()
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Sends command to the updateMgr to start update procedure
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	performUpdate:function (success, fail, args, env) {
		try {
			_updates.performUpdate()
			success();
		} catch (e) {
			fail(-1, e);
		}
	}
};

