/**
 * The abstraction layer for settings functionality
 *
 * @author mlapierre
 * $Id: settings.js 4326 2012-09-27 17:43:24Z mlapierre@qnx.com $
 */

var	_pps = require('../../lib/pps/ppsUtils'),
	_readerPPS,
	_writerPPS,
	_trigger;

/**
 * Initializes the extension 
 */
function init() {
	try {
		// readerPPS
		_readerPPS = _pps.createObject();
		_readerPPS.init();
		_readerPPS.onChange = function(event) {
			if (_trigger && event && event.data) {
				_trigger(event.data);
			}
		};

		// writerPPS
		_writerPPS = _pps.createObject();
		_writerPPS.init();
		
		// Open the PPS objects
		if(!_readerPPS.open("/pps/qnxcar/system/settings", JNEXT.PPS_RDONLY)
			|| !_writerPPS.open("/pps/qnxcar/system/settings", JNEXT.PPS_WRONLY)) {

			console.error('qnx.settings settings.js::init() - Error opening "/pps/qnxcar/system/settings".');

			_readerPPS.close();
			_writerPPS.close();
		} else {
			// Perform a manual read so the PPS object data is populated immediately rather
			// than waiting for the first read.
			_readerPPS.read();
		}
	} catch(ex) {
		console.error('qnx.settings settings.js::init() - Error occurred during initialization.', ex);
	}
};
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Sets the trigger function to call when an event is fired
	 * @param trigger {Function} The trigger function to call when an event is fired
	 */
	setTrigger: function(trigger) {
		_trigger = trigger;
	},
	
	/**
	 * Returns system settings
	 * @param settings {Array} A list of settings to get [optional]
	 * @returns {Object} The requested settings
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
	 * Sets one or more system settings
	 * @param args {Object} The system settings to set
	 * NOTE: the list of settings is not fixed and depends on your system configuration
	 */
	set: function(settings) {
		if (settings && Object.keys(settings).length > 0) {
			//write args to pps
			_writerPPS.write(settings);
		}
	},
};
