/**
 * The event context for navigation events
 *
 * @author mlapierre
 * $Id: context.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _navigation = require("./navigation");

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
				case "navigationupdate":
					_navigation.setUpdateTrigger(trigger);
					break;

				case "navigationstarted":
					_navigation.setStartedTrigger(trigger);
					break;

				case "navigationstopped":
					_navigation.setStoppedTrigger(trigger);
					break;

				case "navigationerror":
					_navigation.setErrorTrigger(trigger);
					break;

				case "navigationpoiresult":
					_navigation.setPOIResultTrigger(trigger);
					break;

				case "navigationpoisearchresult":
					_navigation.setPOISearchResultTrigger(trigger);
					break;

				case "navigationsearchresult":
					_navigation.setSearchResultTrigger(trigger);
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
				case "navigationupdate":
					_navigation.setUpdateTrigger(null);
					break;

				case "navigationstarted":
					_navigation.setStartedTrigger(null);
					break;

				case "navigationstopped":
					_navigation.setStoppedTrigger(null);
					break;

				case "navigationerror":
					_navigation.setErrorTrigger(null);
					break;

				case "navigationpoiresult":
					_navigation.setPOIResultTrigger(null);
					break;

				case "navigationpoisearchresult":
					_navigation.setPOISearchResultTrigger(null);
					break;

				case "navigationsearchresult":
					_navigation.setSearchResultTrigger(null);
					break;
			}
		}
	}
};
