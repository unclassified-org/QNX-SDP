/**
 * The event context for radio events.
 *
 * @author lgreenway
 * $Id: context.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _radio = require("./radio");

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
				case "radiometadatachanged":
					_radio.setMetadataChangedTrigger(trigger);
					break;
				case "radiopresetschanged":
					_radio.setPresetsChangedTrigger(trigger);
					break;
				case "radiotunerchanged":
					_radio.setTunerChangedTrigger(trigger);
					break;
				case "radiostationchanged":
					_radio.setStationChangedTrigger(trigger);
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
				case "radiometadatachanged":
					_radio.setMetadataChangedTrigger(null);
					break;
				case "radiopresetschanged":
					_radio.setPresetsChangedTrigger(null);
					break;
				case "radiotunerchanged":
					_radio.setTunerChangedTrigger(null);
					break;
				case "radiostationchanged":
					_radio.setStationChangedTrigger(null);
					break;
			}
		}
	}
};
