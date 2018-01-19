/**
 * Defines Phone operations
 * @author mlytvynyuk
 * $Id: index.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _wwfix = require("../../lib/wwfix"),
	_event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
	_actionMap = {
		/**
		 * @event
		 * Triggered when ready to accept commands (HFP connected and not busy)
		 */
		phoneready:{
			context:require("./context"),
			event:"phoneready",
			trigger:function (args) {
				_event.trigger("phoneready", args);
			}
		},
		/**
		 * @event
		 * Triggered when phone is dialing out
		 */
		phonedialing:{
			context:require("./context"),
			event:"phonedialing",
			trigger:function (args) {
				_event.trigger("phonedialing", args);
			}
		},
		/**
		 * @event
		 * Triggered when phone has active call
		 */
		phonecallactive:{
			context:require("./context"),
			event:"phonecallactive",
			trigger:function (args) {
				_event.trigger("phonecallactive", args);
			}
		},
		/**
		 * @event
		 * Triggered when there is incoming call
		 */
		phoneincoming:{
			context:require("./context"),
			event:"phoneincoming",
			trigger:function (args) {
				_event.trigger("phoneincoming", args);
			}
		}
	}

var _phone = require("./phone");

/**
 * Initializes the extension 
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
		_phone.init();
	} catch (ex) {
		console.error('Error in webworks ext: phone/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Dial a number
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	dial: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(_phone.dial(args.number));
		} catch (e) {
			fail(-1, e);
		}
	},
	/**
	 * Accept incoming call
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	accept: function(success, fail, args, env) {
		try {
			_phone.accept();
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	/**
	 * Hangs up current active call
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	hangup: function(success, fail, args, env) {
		try {
			_phone.hangup();
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	/**
	 * Redials last called number
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	redial: function(success, fail, args, env) {
		try {
			_phone.redial()
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	/**
	 * Return current state of phone
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getState: function(success, fail, args, env) {
		try {
			success(_phone.getState());
		} catch (e) {
			fail(-1, e);
		}
	}
};

