/**
 * The event context for car.mediaplayer.
 *
 * @author lgreenway
 * $Id: context.js 6368 2013-05-27 16:59:58Z lgreenway@qnx.com $
 */

var _mediaplayer = require("./mediaplayer"),
	Event = require('./enum/Event');

/**
 * Sets or removes the specified event trigger.
 * @param event {String} The event name
 * @param trigger {Function} The trigger function to call when the event is fired. Null if removing the trigger.
 */
function setListener(event, trigger) {
	switch (event) {
		case Event.MEDIA_SOURCE_CHANGE:
			_mediaplayer.setMediaSourceChangeTrigger(trigger);
			break;
		case Event.TRACK_SESSION_CHANGE:
			_mediaplayer.setTrackSessionChangeTrigger(trigger);
			break;
		case Event.PLAYER_STATE_CHANGE:
			_mediaplayer.setPlayerStateChangeTrigger(trigger);
			break;
		case Event.TRACK_CHANGE:
			_mediaplayer.setTrackChangeTrigger(trigger);
			break;
		case Event.TRACK_POSITION_CHANGE:
			_mediaplayer.setTrackPositionChangeTrigger(trigger);
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
