/**
 * The event context for audio mixer events
 *
 * @author mlapierre
 * $Id: context.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _audiomixer = require("./audiomixer"),
	Event = require('./enum/Event');


/**
 * Sets or removes the specified event trigger.
 * @param event {String} The event name
 * @param trigger {Function} The trigger function to call when the event is fired. Null if removing the trigger.
 */
function setListener(event, trigger) {
	switch (event) {
		case Event.UPDATE:
			_audiomixer.setTriggerUpdate(trigger);
			break;
	}
}

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
			setListener(event, trigger);
		}
	},

	/**
	 * Method called when the last listener is removed for an event
	 * @param event {String} The event name
	 */
	removeEventListener: function (event) {
		if (event) {
			setListener(event, null);
		}
	}
};
