/**
 * The event context for keyboard events
 *
 * @author mlapierre
 * $Id: context.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _keyboard = require("./keyboard");

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
				case "keyboardevent":
					_keyboard.setTrigger(trigger);
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
				case "keyboardevent":
					_keyboard.setTrigger(null);
					break;
			}
		}
	}
};
