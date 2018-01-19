/**
 * The event context for contact service events.
 *
 * @author lgreenway
 * $Id: context.js 4726 2012-10-24 15:55:42Z lgreenway@qnx.com $
 */

var _pbap = require("./pbap");

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Method called when the first listener is added for an event
	 * @param event {String} The event name
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	addEventListener: function (event, trigger) {
		if (event && trigger) {
			switch (event) {
				case "bluetoothpbapstatechange":
					_pbap.setStateChangedTrigger(trigger);
					break;
				case "bluetoothpbapstatuschange":
					_pbap.setStatusChangedTrigger(trigger);
					break;
			}
		}
	},

	/**
	 * Method called when the last listener is removed for an event
	 * @param event {String} The event name
	 */
	removeEventListener: function (event) {
		if (event) {
			switch (event) {
				case "bluetoothpbapstatechange":
					_pbap.setStateChangedTrigger(null);
					break;
				case "bluetoothpbapstatuschange":
					_pbap.setStatusChangedTrigger(null);
					break;
			}
		}
	}
};
