/**
 * The event context for Handsfree events
 *
 * @author  mlytvynyuk
 * $Id: context.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _phone = require("./phone");

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Method called when the first listener is added for an event
	 * @param event {String} The event name
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	addEventListener:function (event, trigger) {
		if (event && trigger) {
			switch (event) {
				case "phoneready":
					_phone.setPhoneReadyTrigger(trigger);
					break;
				case "phonedialing":
					_phone.setPhoneDialingTrigger(trigger);
					break;
				case "phonecallactive":
					_phone.setPhoneCallActiveTrigger(trigger);
					break;
				case "phoneincoming":
					_phone.setPhoneIncomingTrigger(trigger);
					break;
			}
		}
	},

	/**
	 * Method called when the last listener is removed for an event
	 * @param event {String} The event name
	 */
	removeEventListener:function (event) {
		if (event) {
			switch (event) {
				case "phoneready":
					_phone.setPhoneReadyTrigger(null);
					break;
				case "phonedialing":
					_phone.setPhoneDialingTrigger(null);
					break;
				case "phonecallactive":
					_phone.setPhoneCallActiveTrigger(null);
					break;
				case "phoneincoming":
					_phone.setPhoneIncomingTrigger(null);
					break;
			}
		}
	}
};
