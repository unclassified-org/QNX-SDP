/**
 * The abstraction layer for hvac functionality
 *
 * @author mlapierre
 * $Id: sensors.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var	_pps = require('../../lib/pps/ppsUtils'),
	_readerPPS,
	_trigger;

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	
	/**
	 * Initializes the extension 
	 */
	init: function() {
		//readerPPS
		_readerPPS = _pps.createObject();
		_readerPPS.init();
		_readerPPS.onChange = function(event) {
			if (_trigger && event && event.data) {
				_trigger(event.data);
			}
		};
		_readerPPS.open("/pps/qnxcar/sensors", JNEXT.PPS_RDONLY);
	},
	
	/**
	 * Sets the trigger function to call when an event is fired
	 * @param trigger {Function} The trigger function to call when an event is fired
	 */
	setTrigger: function(trigger) {
		_trigger = trigger;
	},
	
	/**
	 * Returns the current vehicle sensors
	 * @param sensors {Array} A list of sensors to get [optional]
	 * @returns {Object} The requested vehicle sensors
	 * Ex: {
	 *		speed: 0,
	 *		tire_pressure_fl: 31,
	 *		tire_pressure_fr: 31,
	 *		[...]
	 * 	}
	 */
	get: function(sensors) {
		if (sensors && sensors.length > 0) {
			var out = {};
			for (var i=0; i<sensors.length; i++) {
				out[sensors[i]] = _readerPPS.ppsObj[sensors[i]];
			}
			return out;
		} else {
			return _readerPPS.ppsObj;
		}
	},
};
