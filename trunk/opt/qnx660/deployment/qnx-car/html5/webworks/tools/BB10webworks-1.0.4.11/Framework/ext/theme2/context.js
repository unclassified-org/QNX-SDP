/**
 * The event context for theme events
 *
 * @author mlapierre
 * $Id: context.js 4457 2012-09-29 20:39:54Z edagenais@lixar.com $
 */

var _theme = require("./theme");

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
				case "themeupdate":
					_theme.setTrigger(trigger);
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
				case "themeupdate":
					_theme.setTrigger(null);
					break;
			}
		}
	}
};
