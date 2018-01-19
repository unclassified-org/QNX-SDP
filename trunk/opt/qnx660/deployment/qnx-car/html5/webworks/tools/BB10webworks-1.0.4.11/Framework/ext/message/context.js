/**
 * The event context for message service events.
 *
 * @author lgreenway
 * $Id: context.js 4377 2012-09-28 22:34:57Z lgreenway@qnx.com $
 */

var _message = require("./message");

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
				case "messageservicestatechange":
					_message.setStateChangedTrigger(trigger);
					break;
				case "messageservicefindresult":
					_message.setFindResultTrigger(trigger);
					break;
				case "messageservicefindfail":
					_message.setFindFailTrigger(trigger);
					break;
				case "messageservicemessageresult":
					_message.setMessageResultTrigger(trigger);
					break;
				case "messageservicemessagefail":
					_message.setMessageFailTrigger(trigger);
					break;
				case "messageservicenotification":
					_message.setNotificationTrigger(trigger);
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
				case "messageservicestatechange":
					_message.setStateChangedTrigger(null);
					break;
				case "messageservicefindresult":
					_message.setFindResultTrigger(null);
					break;
				case "messageservicefindfail":
					_message.setFindFailTrigger(null);
					break;
				case "messageservicemessageresult":
					_message.setMessageResultTrigger(null);
					break;
				case "messageservicemessagefail":
					_message.setMessageFailTrigger(null);
					break;
				case "messageservicenotification":
					_message.setNotificationTrigger(null);
					break;
			}
		}
	}
};
