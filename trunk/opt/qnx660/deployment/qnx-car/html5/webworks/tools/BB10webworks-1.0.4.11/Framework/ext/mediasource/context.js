/**
 * The event context for media source events
 *
 * @author mlapierre
 * $Id: context.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _mediasource = require("./mediasource");

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
				case "mediasourceupdate":
					_mediasource.setUpdateTrigger(trigger);
					break;

				case "mediasourceadded":
					_mediasource.setAddedTrigger(trigger);
					break;

				case "mediasourceremoved":
					_mediasource.setRemovedTrigger(trigger);
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
				case "mediasourceupdate":
					_mediasource.setUpdateTrigger(null);
					break;

				case "mediasourceadded":
					_mediasource.setAddedTrigger(null);
					break;

				case "mediasourceremoved":
					_mediasource.setRemovedTrigger(null);
					break;
			}
		}
	}
};
