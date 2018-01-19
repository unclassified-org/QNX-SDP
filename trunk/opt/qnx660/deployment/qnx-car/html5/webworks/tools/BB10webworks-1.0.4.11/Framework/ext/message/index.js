/**
 * Allows access to device contact PIM storage.
 *
 * @author lgreenway, mlytvynyuk
 * $Id: index.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
var _wwfix = require("../../lib/wwfix"),
	_event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
	_actionMap = {
		/**
		 * @event
		 * Triggered when the messages service state changes
		 */
		messageservicestatechange:{
			context:require("./context"),
			event:"messageservicestatechange",
			trigger:function (args) {
				_event.trigger("messageservicestatechange", args);
			}
		},
		/**
		 * @event
		 * Triggered when there list of messages available
		 */
		messageservicefindresult:{
			context:require("./context"),
			event:"messageservicefindresult",
			trigger:function (args) {
				_event.trigger("messageservicefindresult", args);
			}
		},
		/**
		 * @event
		 * Triggered when there request for list of messages failed
		 */
		messageservicefindfail:{
			context:require("./context"),
			event:"messageservicefindfail",
			trigger:function (args) {
				_event.trigger("messageservicefindfail", args);
			}
		},
		/**
		 * @event
		 * Triggered when there full messages available
		 */
		messageservicemessageresult:{
			context:require("./context"),
			event:"messageservicemessageresult",
			trigger:function (args) {
				_event.trigger("messageservicemessageresult", args);
			}
		},
		/**
		 * @event
		 * Triggered when request of full messages failed
		 */
		messageservicemessagefail:{
			context:require("./context"),
			event:"messageservicemessagefail",
			trigger:function (args) {
				_event.trigger("messageservicemessagefail", args);
			}
		},
		/**
		 * @event
		 * Triggered when there is a notification from service
		 */
		messageservicenotification:{
			context:require("./context"),
			event:"messageservicenotification",
			trigger:function (args) {
				_event.trigger("messageservicenotification", args);
			}
		}
	},
	_message = require("./message");

/**
 * Initializes the extension
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
		_message.init();
	} catch (ex) {
		console.error('Error in webworks ext: message/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Return a list of message accounts.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getAccounts: function(success, fail, args, env) {
		args = _wwfix.parseArgs(args);
		try {
			success(_message.getAccounts(typeof(args['messageType']) === 'string' ? args['messageType'] : null));
		} catch (e) {
			fail(-1, e);
		}
	},
		
	/**
	 * Return an array of zero or more messages.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	find: function(success, fail, args, env) {
		args = _wwfix.parseArgs(args);
		try {
			success(_message.find(typeof(args['filter']) === 'object' ? args['filter'] : null,
				typeof(args['orderBy']) === 'string' ? args['orderBy'] : null,
				typeof(args['isAscending']) === 'boolean' ? args['isAscending'] : null,
				typeof(args['limit']) === 'number' ? args['limit'] : null,
				typeof(args['offset']) === 'number' ? args['offset'] : null));
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Gets a list of folders for the specified account.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getFolders: function(success, fail, args, env) {
		// TODO Implement
	},
	
	/**
	 * Method retrieves message from the database, check first if message exist in database and return is, if not initiated
	 * PPS request to fetch message by provided message handle.
	 * The message is returned asynchronously, and can be retrieved by listening to the messageservicemessageresult
	 * event. Returns a fully populated message, including full subject, contents, recipient list, and attachments.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getMessage: function(success, fail, args, env) {
		args = _wwfix.parseArgs(args);
		try {
			_message.getMessage(args.accountId, args.handle);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Saves a message.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	save: function(success, fail, args, env) {
		args = _wwfix.parseArgs(args);
		try {
			success(_message.save(args.message));
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Removes a message.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	remove: function(success, fail, args, env) {
		args = _wwfix.parseArgs(args);
		try {
			success(_message.remove(args.message));
		} catch (e) {
			fail(-1, e);
		}
	},
	/**
	 * move a message to another folder
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	move: function(success, fail, args, env) {
		args = _wwfix.parseArgs(args);
		try {
			success(_message.move(args.message, args.folder));
		} catch (e) {
			fail(-1, e);
		}
	},
	/**
	 * Sends a message.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	send: function(success, fail, args, env) {
		args = _wwfix.parseArgs(args);
		try {
			success(_message.send(args.message));
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Gets the current state of the phone book profile service.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getState: function(success, fail, args, env) {
		try {
			success(_message.getState());
		} catch (e) {
			fail(-1, e);
		}
	}
};

