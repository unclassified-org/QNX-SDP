/**
 * The abstraction layer for hmi notification manager (HNM)
 *
 * @author dkerr
 * $Id:$
 */

var _pps = require('../../lib/pps/ppsUtils'),
	_hnmStatusPPS,
	_hnmNotificationPPS,
	_statusTrigger,
	_notificationTrigger;

/**
 * Method called when the hnm status object changes
 * @param event {Object} The PPS event
 */
function onStatus(event) {
	if (event && event.data) {
		if (_statusTrigger) {
			_statusTrigger(event.data);
		} 
	}
}

/**
 * Method called when the hnm messaging object changes
 * @param event {Object} The PPS event
 */
function onMessage(event) {
	if (event && event.data) {
		if (_notificationTrigger) {
			_notificationTrigger(event.data);
		} 
	}
}


/**
 * Exports are the publicly accessible functions
 */
module.exports = {

	/**
	 * Initializes the extension 
	 */
	init: function() {
		_hnmStatusPPS = _pps.createObject();
		_hnmStatusPPS.init();
		_hnmStatusPPS.onChange = onStatus;
		_hnmStatusPPS.open("/pps/services/hmi-notification/Status", JNEXT.PPS_RDONLY);

		_hnmNotificationPPS = _pps.createObject();
		_hnmNotificationPPS.init();
		_hnmNotificationPPS.onChange = onMessage;
		_hnmNotificationPPS.open("/pps/services/hmi-notification/Messaging", JNEXT.PPS_RDWR);
	},

	/**
	 * Sets the trigger function to call when an hnm event is received
	 * @param trigger {Function} The trigger function to call when the response is received
	 */
	setStatusTrigger: function(trigger) {
		_statusTrigger = trigger;
	},

	/**
	 * Sets the trigger function to call when an hnm event is received
	 * @param trigger {Function} The trigger function to call when the response is received
	 */
	setNotificationTrigger: function(trigger) {
		_notificationTrigger = trigger;
	}
};
