/**
 * Defines Bluetooth operations
 *
 * @author mlapierre, mlytvynyuk
 * $Id: index.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _wwfix = require("../../lib/wwfix"),
	_event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
	_actionMap = {
		/**
		 * @event
		 * Triggered when new device found
		 */
		bluetoothnewdevice:{
			context:require("./context"),
			event:"bluetoothnewdevice",
			trigger:function (args) {
				_event.trigger("bluetoothnewdevice", args);
			}
		},
		/**
		 * @event
		 * Triggered when one new paired device created
		 */
		bluetoothnewpaireddevice:{
			context:require("./context"),
			event:"bluetoothnewpaireddevice",
			trigger:function (args) {
				_event.trigger("bluetoothnewpaireddevice", args);
			}
		},
		/**
		 * @event
		 * Triggered when one pairing is complete
		 */
		bluetoothpairingcomplete:{
			context:require("./context"),
			event:"bluetoothpairingcomplete",
			trigger:function (args) {
				_event.trigger("bluetoothpairingcomplete", args);
			}
		},
		/**
		 * @event
		 * Triggered when search is complete
		 */
		bluetoothsearchcomplete:{
			context:require("./context"),
			event:"bluetoothsearchcomplete",
			trigger:function (args) {
				_event.trigger("bluetoothsearchcomplete", args);
			}
		},
		/**
		 * @event
		 * Triggered when search is cancelled
		 */
		bluetoothsearchcancelled:{
			context:require("./context"),
			event:"bluetoothsearchcancelled",
			trigger:function (args) {
				_event.trigger("bluetoothsearchcancelled", args);
			}
		},
		/**
		 * @event
		 * Triggered when search start failed
		 */
		bluetoothsearchstartfailed:{
			context:require("./context"),
			event:"bluetoothsearchstartfailed",
			trigger:function (args) {
				_event.trigger("bluetoothsearchstartfailed", args);
			}
		},
		/**
		 * @event
		 * Triggered when pairing failed
		 */
		bluetoothpairingfailed:{
			context:require("./context"),
			event:"bluetoothpairingfailed",
			trigger:function (args) {
				_event.trigger("bluetoothpairingfailed", args);
			}
		},
		/**
		 * @event
		 * Triggered when pairing cancelled
		 */
		bluetoothpairingcancelled:{
			context:require("./context"),
			event:"bluetoothpairingcancelled",
			trigger:function (args) {
				_event.trigger("bluetoothpairingcancelled", args);
			}
		},
		/**
		 * @event
		 * Triggered when initialisation if pairing failed
		 */
		bluetoothinitpairingfail:{
			context:require("./context"),
			event:"bluetoothinitpairingfail",
			trigger:function (args) {
				_event.trigger("bluetoothinitpairingfail", args);
			}
		},
		/**
		 * @event
		 * Triggered when initialisation if pairing is ok
		 */
		bluetoothinitpairingsuccess:{
			context:require("./context"),
			event:"bluetoothinitpairingsuccess",
			trigger:function (args) {
				_event.trigger("bluetoothinitpairingsuccess", args);
			}
		},
		/**
		 * @event
		 * Triggered on incoming authorization request
		 */
		bluetoothauthrequest:{
			context:require("./context"),
			event:"bluetoothauthrequest",
			trigger:function (args) {
				_event.trigger("bluetoothauthrequest", args);
			}
		},
		/**
		 * @event
		 * Triggered when current command failed
		 */
		bluetoothcommandfailed:{
			context:require("./context"),
			event:"bluetoothcommandfailed",
			trigger:function (args) {
				_event.trigger("bluetoothcommandfailed", args);
			}
		},
		/**
		 * @event
		 * Triggered when Bluetooth stack busy
		 */
		bluetoothcommandbusy:{
			context:require("./context"),
			event:"bluetoothcommandbusy",
			trigger:function (args) {
				_event.trigger("bluetoothcommandbusy", args);
			}
		},
		/**
		 * @event
		 * Triggered when service connected
		 */
		bluetoothserviceconnected:{
			context:require("./context"),
			event:"bluetoothserviceconnected",
			trigger:function (args) {
				_event.trigger("bluetoothserviceconnected", args);
			}
		},
		/**
		 * @event
		 * Triggered when service connect failed
		 */
		bluetoothserviceconnectfailed:{
			context:require("./context"),
			event:"bluetoothserviceconnectfailed",
			trigger:function (args) {
				_event.trigger("bluetoothserviceconnectfailed", args);
			}
		},
		/**
		 * @event
		 * Triggered when service disconnected
		 */
		bluetoothservicedisconnected:{
			context:require("./context"),
			event:"bluetoothservicedisconnected",
			trigger:function (args) {
				_event.trigger("bluetoothservicedisconnected", args);
			}
		},
		/**
		 * @event
		 * Triggered when service disconnect failed
		 */
		bluetoothservicedisconnectfailed:{
			context:require("./context"),
			event:"bluetoothservicedisconnectfailed",
			trigger:function (args) {
				_event.trigger("bluetoothservicedisconnectfailed", args);
			}
		},
		/**
		 * @event
		 * Triggered when paired device deleted successfully
		 */
		bluetoothpaireddevicedeleted:{
			context:require("./context"),
			event:"bluetoothpaireddevicedeleted",
			trigger:function (args) {
				_event.trigger("bluetoothpaireddevicedeleted", args);
			}
		},
		/**
		 * @event
		 * Triggered when paired device delete failed
		 */
		bluetoothpaireddevicedeletefailed:{
			context:require("./context"),
			event:"bluetoothpaireddevicedeletefailed",
			trigger:function (args) {
				_event.trigger("bluetoothpaireddevicedeletefailed", args);
			}
		},
		/**
		 * @event
		 * Triggered when a low level (ACL) connection has been established with a remote device
		 */
		bluetoothaclconnected:{
			context:require("./context"),
			event:"bluetoothaclconnected",
			trigger:function (args) {
				_event.trigger("bluetoothaclconnected", args);
			}
		},
		/**
		 * @event
		 * Triggered there is change in bluetooth services object (some connected/disconnected)
		 */
		bluetoothservicestatechanged:{
			context:require("./context"),
			event:"bluetoothservicestatechanged",
			trigger:function (args) {
				_event.trigger("bluetoothservicestatechanged", args);
			}
		}
	},
	_bluetooth = require("./bluetooth");

/**
 * Initializes the extension
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
		_bluetooth.init();
	} catch (ex) {
		console.error('Error in webworks ext: bluetooth/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Sets the device name
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	setName:function (success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(_bluetooth.setName(args.name));
		} catch (e) {
			fail(-1, e);
		}
	},
	/**
	 * Sets the Bluetooth device accessibility mode
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	setAccessibilityMode:function (success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(_bluetooth.setAccessibilityMode(args.mode));
		} catch (e) {
			fail(-1, e);
		}
	},


	/**
	 * Cancel a search in progress
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	search:function (success, fail, args, env) {
		try {
			_bluetooth.search()
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Cancel a search in progress
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	cancelSearch:function (success, fail, args, env) {
		try {
			_bluetooth.cancelSearch()
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Pair to a Bluetooth device
	 * Cancel a search in progress
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	pair:function (success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(_bluetooth.pair(args.mac));
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Cancel a pairing operation in progress
	 * Cancel a search in progress
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	cancelPair:function (success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(_bluetooth.cancelPair(args.mac));
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Saves authorization information to the BT stack.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	saveDevice:function (success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(
				_bluetooth.saveDevice(args.mac, args.parameters)
			);
		} catch (e) {
			fail(-1, e);
		}
	},
	/**
	 * Returns Bluetooth settings
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		settings: {Array}, //a list of settings to get [optional]
	 *	}
	 * @param env {Object} Environment variables
	 */
	getOptions:function (success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(_bluetooth.getOptions((args && args.settings) ? args.settings : null));
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Sets one or more Bluetooth settings
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		*: {Mixed},	//the arguments for this function are dynamic and could be anything
	 *		[...]
	 *	}
	 * @param env {Object} Environment variables
	 */
	setOptions:function (success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_bluetooth.setOptions(args.settings);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Connects to specified service on device
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		*: {Mixed},	//the arguments for this function are dynamic and could be anything
	 *		[...]
	 *	}
	 * @param env {Object} Environment variables
	 */
	connectService:function (success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(_bluetooth.connectService(args.service, args.mac));
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Disconnects from specified service on device
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		*: {Mixed},	//the arguments for this function are dynamic and could be anything
	 *		[...]
	 *	}
	 * @param env {Object} Environment variables
	 */
	disconnectService:function (success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(_bluetooth.disconnectService(args.service, args.mac));
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Gets a list of connected devices for bluetooth services.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		*: {Mixed},	//the arguments for this function are dynamic and could be anything
	 *		[...]
	 *	}
	 * @param env {Object} Environment variables
	 */
	getConnectedDevices:function (success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(_bluetooth.getConnectedDevices(args.service));
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Remove a paired device and revoke its authorization to pair
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		*: {Mixed},	//the arguments for this function are dynamic and could be anything
	 *		[...]
	 *	}
	 * @param env {Object} Environment variables
	 */
	removeDevice:function (success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(_bluetooth.removeDevice(args.mac));
		} catch (e) {
			fail(-1, e);
		}
	},
	/**
	 * Return list of paired devices
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		*: {Mixed},	//the arguments for this function are dynamic and could be anything
	 *		[...]
	 *	}
	 * @param env {Object} Environment variables
	 */
	getPaired:function (success, fail, args, env) {
		try {
			success(_bluetooth.getPaired());
		} catch (e) {
			fail(-1, e);
		}
	},
	/**
	 * Get a list of available Bluetooth services for a device
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		*: {Mixed},	//the arguments for this function are dynamic and could be anything
	 *		[...]
	 *	}
	 * @param env {Object} Environment variables
	 */
	getServices:function (success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(_bluetooth.getServices(args.mac));
		} catch (e) {
			fail(-1, e);
		}
	}
};

