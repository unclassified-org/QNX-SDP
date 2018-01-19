/**
* Allows access to voice services
 *
 * @author mlapierre
 * $Id: index.js 4280 2012-09-25 19:22:34Z dkerr@qnx.com $
 */

var _wwfix = require("../../lib/wwfix"),
	_event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
	_actionMap = {
		/**
		 * @event
		 * Triggered when the voice system changes state
		 */
		voicestate: {
			context: require("./context"),
			event: "voicestate",
			trigger: function (args) {
				_event.trigger("voicestate", args);
			}
		},
		/**
		 * @event
		 * Triggered when the voice recognition result is returned
		 */
		voiceresult: {
			context: require("./context"),
			event: "voiceresult",
			trigger: function (args) {
				_event.trigger("voiceresult", args);
			}
		},
		/**
		 * @event
		 * Triggered when the voice recognition utterance is either interpreted into an action or 
		 * not understood. Result is either 'handled' or 'unhandled' 
		 */
		voicehandled: {
			context: require("./context"),
			event: "voicehandled",
			trigger: function (args) {
				_event.trigger("voicehandled", args);
			}
		},
	},
	_voice = require("./voice");

/**
 * Initializes the extension 
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
		_voice.init();
	} catch (ex) {
		console.error('Error in webworks ext: voice/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Tells the system to listen for a voice command
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	listen: function(success, fail, args, env) {
		try {
			_voice.listen();
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Tells the system that you are finished saying your voice command
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	stopListening: function(success, fail, args, env) {
		try {
			_voice.stopListening();
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Tells the system to cancel voice recognition in progress
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	cancel: function(success, fail, args, env) {
		try {
			_voice.cancel();
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Say a string using text-to-speech
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		text: {String}, //the string to say
	 *	}
	 * @param env {Object} Environment variables
	 */
	say: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_voice.say(args.text);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Informs the system of the available applications it can launch
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		app_list: {Array}, //the list of applications
	 *	}
	 * @param env {Object} Environment variables
	 */
	setList: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_voice.setList(args);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Adds an item to the list of available applications the system can launch
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		item: {String}, //the name of the item
	 *	}
	 * @param env {Object} Environment variables
	 */
	addItem: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_voice.addItem(args.item);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Retrieves the state of the voice req service
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: n/a
	 * @param env {Object} Environment variables
	 */
	getState: function(success, fail, args, env) {
		try {
			success(_voice.getState());
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Retrieves the state of the voice req speech attribute
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: n/a 
	 * @param env {Object} Environment variables
	 */
	getSpeechState: function(success, fail, args, env) {
		try {
			success(_voice.getSpeechState());
		} catch (e) {
			fail(-1, e);
		}
	}
};

