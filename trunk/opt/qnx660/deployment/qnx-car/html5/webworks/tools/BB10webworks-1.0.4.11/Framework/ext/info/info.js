/**
 * The abstraction layer for hvac functionality
 *
 * @author mlapierre
 * $Id: info.js 4326 2012-09-27 17:43:24Z mlapierre@qnx.com $
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
		_readerPPS.open("/pps/qnxcar/system/info", JNEXT.PPS_RDONLY);
	},
	
	/**
	 * Returns the current system information
	 * @returns {Object} The system information
	 * Ex: {
	 * 		date: {String},
	 * 		buildHost: {String},
	 * 		buildID: {String},
	 * 		buildNum: {String},
	 * 		car2Branch: {String},
	 * 		car2Rev: {String},
	 * 		externalBranch: {String},
	 * 		externalRev: {String},
	 * 		platform: {String},
	 * 		variant: {String}
	 * 	}
	 * NOTE: the list of settings is not fixed and depends on your system configuration
	 */
	get: function() {
		return _readerPPS.ppsObj;
	},
};
