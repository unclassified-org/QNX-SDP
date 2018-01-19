/**
 * The event context for application events
 *
 * @author dkerr
 * $Id: context.js 4435 2012-09-29 17:49:54Z mlapierre@qnx.com $
 */

var _application = require("./application");

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
				case "pause":
					_application.setPauseTrigger(trigger);
					break;
				case "resume":
					_application.setResumeTrigger(trigger);
					break;
				case "reselect":
					_application.setReselectTrigger(trigger);
					break;
				case "appdata":
					_application.setAppDataTrigger(trigger);
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
				case "pause":
					_application.setPauseTrigger(null);
					break;
				case "resume":
					_application.setResumeTrigger(null);
					break;
				case "reselect":
					_application.setReselectTrigger(null);
					break;
				case "appdata":
					_application.setAppDataTrigger(trigger);
					break;
			}
		}
	}
};
