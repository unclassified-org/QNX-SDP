/**
 * The abstraction layer for hvac functionality
 *
 * @author mlapierre
 * $Id: hvac.js 4326 2012-09-27 17:43:24Z mlapierre@qnx.com $
 */

var	_pps = require('../../lib/pps/ppsUtils'),
	_readerPPS,
	_writerPPS,
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
		_readerPPS.open("/pps/qnxcar/hvac", JNEXT.PPS_RDONLY);

		//writerPPS
		_writerPPS = _pps.createObject();
		_writerPPS.init();
		_writerPPS.open("/pps/qnxcar/hvac", JNEXT.PPS_WRONLY);
	},
	
	/**
	 * Sets the trigger function to call when an event is fired
	 * @param trigger {Function} The trigger function to call when an event is fired
	 */
	setTrigger: function(trigger) {
		_trigger = trigger;
	},
	
	/**
	 * Returns HVAC settings
	 * @param settings {Array} A list of settings to get [optional]
	 * @returns {Object} The requested settings
	 * Ex: {
	 *		airCirculation_setting: {Boolean},
	 *		airConditioning_enabled: {Boolean},
	 *		fan_setting_l: {Number},
	 *		[...]
	 * 	}
	 * NOTE: the list of settings is not fixed and depends on your system configuration
	 */
	get: function(settings) {
		if (settings && settings.length > 0) {
			var out = {};
			for (var i=0; i<settings.length; i++) {
				out[settings[i]] = _readerPPS.ppsObj[settings[i]];
			}
			return out;
		} else {
			return _readerPPS.ppsObj;
		}
	},
	
	/**
	 * Sets one or more HVAC settings
	 * @param args {Object} The HVAC settings to set
	 * Ex: {
	 *		fan_setting_l: {Number},
	 *		fan_setting_r: {Number},
	 *		[...]
	 * 	}
	 * NOTE: the list of settings is not fixed and depends on your system configuration
	 */
	set: function(settings) {
		if (settings && Object.keys(settings).length > 0) {
			//write args to pps
			_writerPPS.write(settings);
		}
	},
};
