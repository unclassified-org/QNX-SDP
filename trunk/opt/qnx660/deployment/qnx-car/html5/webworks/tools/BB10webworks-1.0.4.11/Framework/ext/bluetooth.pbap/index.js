/**
 * Allows access to device contact PIM storage.
 *
 * @author lgreenway
 * $Id: index.js 4726 2012-10-24 15:55:42Z lgreenway@qnx.com $
 */
var _wwfix = require("../../lib/wwfix"),
	_event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
	_actionMap = {
		/**
		 * @event
		 * Triggered when the contact service state has changed.
		 */
		bluetoothpbapstatechange: {
			context: require("./context"),
			event: "bluetoothpbapstatechange",
			trigger: function (args) {
				_event.trigger("bluetoothpbapstatechange", args);
			}
		},
		/**
		 * @event
		 * Triggered when the contact service status has changed.
		 */
		bluetoothpbapstatuschange: {
			context: require("./context"),
			event: "bluetoothpbapstatuschange",
			trigger: function (args) {
				_event.trigger("bluetoothpbapstatuschange", args);
			}
		}
	},
	_pbap = require("./pbap");

/**
 * Initializes the extension 
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
		_pbap.init();
	} catch (ex) {
		console.error('Error in webworks ext: blueooth.pbap/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * 
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	find: function(success, fail, args, env) {
		args = _wwfix.parseArgs(args);
		try {
			success(_pbap.find(typeof(args['filter']) === 'object' ? args['filter'] : null,
									typeof(args['orderBy']) === 'string' ? args['orderBy'] : null,
									typeof(args['isAscending']) === 'boolean' ? args['isAscending'] : null,
									typeof(args['limit']) === 'number' ? args['limit'] : null,
									typeof(args['offset']) === 'number' ? args['offset'] : null));
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Creates or updates a contact.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	save: function(success, fail, args, env) {
		args = _wwfix.parseArgs(args);
		try {
			success(_pbap.save(contact));
		} catch(e) {
			fail(-1, e);
		}
	},

	/**
	 * Removes a contact.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	remove: function(success, fail, args, env) {
		args = _wwfix.parseArgs(args);
		try {
			success(_pbap.remove(contact));
		} catch(e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Gets the current state of the contact service.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getState: function(success, fail, args, env) {
		try {
			success(_pbap.getState());
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Gets the current status of the contact service.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getStatus: function(success, fail, args, env) {
		try {
			success(_pbap.getStatus());
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Forces a phone book resynchronization with the connected device.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	refresh: function(success, fail, args, env) {
		try {
			_pbap.refresh();
			success();
		} catch (e) {
			fail(-1, e);
		}
	}
};

