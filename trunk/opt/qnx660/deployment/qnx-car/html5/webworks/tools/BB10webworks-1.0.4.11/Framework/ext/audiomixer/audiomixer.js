/**
 * The abstraction layer for mixer functionality
 *
 * @author mlapierre
 * $Id: audiomixer.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
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
		_readerPPS.open("/pps/services/audio/mixer", JNEXT.PPS_RDONLY);

		//writerPPS
		_writerPPS = _pps.createObject();
		_writerPPS.init();
		_writerPPS.open("/pps/services/audio/mixer", JNEXT.PPS_WRONLY);
	},
	
	/**
	 * Sets the trigger function to call when a mixer event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setTrigger: function(trigger) {
		_trigger = trigger;
	},
	
	/**
	 * Returns the current audio parameters
	 * @param settings {Array} A list of settings to get [optional]
	 * @returns {Object} The requested settings
	 * Ex: {
	 *		bass: 50,
	 * 		treble: 50,
	 *		mid: 30,
	 *		fade: 70,
	 *		balance: 50,
	 * 	}
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
	 * Sets one or more audio parameters
	 * @param args {Object} The audio parameters to set
	 * Ex: {
	 *		fade: {Number},
	 *		balance: {Number},
	 *		bass: {Number},
	 *		mid: {Number},
	 *		treble: {Number},
	 * 		[...]
	 * 	}
	 */
	set: function(args) {
		if (args && Object.keys(args).length > 0) {
			//write args to pps
			_writerPPS.write(args);
		}
	},
};
