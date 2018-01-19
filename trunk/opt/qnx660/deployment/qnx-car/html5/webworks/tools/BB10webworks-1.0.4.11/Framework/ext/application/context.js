/**
 * The event context for application events
 *
 * @author nschultz
 * $Id: context.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
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
			case "installed":
				_application.setInstalledTrigger(trigger);
				break;
			case "uninstalled":
				_application.setUninstalledTrigger(trigger);
				break;
			case "started":
				_application.setStartedTrigger(trigger);
				break;
			case "stopped":
				_application.setStoppedTrigger(trigger);
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
			case "installed":
				_application.setInstalledTrigger(null);
				break;
			case "uninstalled":
				_application.setUninstalledTrigger(null);
				break;
			case "started":
				_application.setStartedTrigger(null);
				break;
			case "stopped":
				_application.setStoppedTrigger(null);
				break;
			}
		}
	}
};