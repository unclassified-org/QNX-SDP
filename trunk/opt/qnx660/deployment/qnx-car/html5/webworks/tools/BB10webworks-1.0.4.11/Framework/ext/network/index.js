/**
 * Allows access to network resources
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
		 * Triggered when the volume is updated
		 */
        networkevent: {
            context: require("./context"),
            event: "networkevent",
            trigger: function (args) {
                _event.trigger("networkevent", args);
            }
        }
    },
	_network = require("./network");

/**
 * Initializes the extension 
 */
function init() {
    var eventExt = _utils.loadExtensionModule("event", "index");
    eventExt.registerEvents(_actionMap);
	_network.init();
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Returns an array of available network interfacesvolume
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getInterfaces: function(success, fail, args, env) {
		try {
			success(_network.getInterfaces());
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Configure network interface parameters
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 * {
	 * 		dhcp: {Boolean},
	 *		ip: {String},
	 * 		netmask: {String},
	 * 		gateway: {String},
	 * }
	 * @param env {Object} Environment variables
	 */
	configureInterface: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_network.configureInterface(args.id, args.params);
			success();
		} catch (e) {
			fail(-1, e);
		}
	}
};

