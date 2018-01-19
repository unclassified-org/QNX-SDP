/**
 * Implements navigation functionality for TCS
 *
 * @author mlapierre
 * $Id: navigation.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var	_pps = require('../../../lib/pps/ppsUtils'),
	_statusPPS,
	_updateTrigger;

/**
 * Method called when the qck object changes
 * @param event {Object} The PPS event
 */
function onQckEvent(event) {
	if (_updateTrigger && event && event.data) {
		_updateTrigger({ maneuvers: [{
			command: event.data.cur_command,
			street: event.data.next_road,
			distance: parseFloat(event.data.rem_distance).toFixed(0),
		}]});
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
		setTimeout( function() {
			_statusPPS = _pps.createObject();
			_statusPPS.init();
			_statusPPS.onChange = onQckEvent;
			var res = _statusPPS.open("/pps/tcs/ccc/qck", JNEXT.PPS_RDONLY);
		}, 30000);
	},

	/**
	 * Sets the trigger function to call when a navigation update event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setUpdateTrigger: function(trigger) {
		_updateTrigger = trigger;
	},
};
