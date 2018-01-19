/**
 * The event context for audio player events
 *
 * @author mlapierre
 * $Id: context.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _audioplayer = require("./audioplayer");

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
				case "audioplayerupdate":
					_audioplayer.setUpdateTrigger(trigger);
					break;

				case "audioplayertrack":
					_audioplayer.setTrackTrigger(trigger);
					break;

				case "audioplayerstate":
					_audioplayer.setStateTrigger(trigger);
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
				case "audioplayerupdate":
					_audioplayer.setUpdateTrigger(null);
					break;

				case "audioplayertrack":
					_audioplayer.setTrackTrigger(null);
					break;

				case "audioplayerstate":
					_audioplayer.setStateTrigger(null);
					break;
			}
		}
	}
};
