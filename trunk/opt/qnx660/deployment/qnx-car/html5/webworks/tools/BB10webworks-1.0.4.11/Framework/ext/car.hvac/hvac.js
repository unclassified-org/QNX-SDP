/**
 * The abstraction layer for hvac functionality
 *
 * @author mlapierre
 * $Id: hvac.js 4326 2012-09-27 17:43:24Z mlapierre@qnx.com $
 */

var	_pps = require('../../lib/pps/ppsUtils'),
	_readerPPS,
	_writerPPS,
	_triggerUpdate;


/**
 * Takes in PPS data and formats it for the extension callbacks
 * @param {Object} data The PPS data
 * @return {Array} An array of data formatted as per the extension documentation 
 */
function dataFormat(data) {
	if (typeof data != 'object') {
		return null;
	}

	var keys = Object.keys(data);
	var out = [];
	for (var i=0; i<keys.length; i++) {
		var splitKey = keys[i].split('_');
		out.push({ setting: splitKey[0], zone: splitKey[1], value: data[keys[i]] });
	}
	return out;
}
	
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
			if (_triggerUpdate && event && event.data) {
				_triggerUpdate(dataFormat(event.data));
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
	setTriggerUpdate: function(trigger) {
		_triggerUpdate = trigger;
	},
	
	/**
	 * Returns HVAC settings
	 * @param settings {Array} A list of car.hvac.HvacSetting values to filter by [optional]
	 * @param zones {Array} A list of car.zones.Zone values to filter by [optional]
	 * @returns {Object} The requested setting values
	 */
	get: function(settings, zones) {
		var doSettingFilter = (settings && settings.length > 0);
		var doZoneFilter = (zones && zones.length > 0);

		//check if we need to filter
		if (doSettingFilter || doZoneFilter) {

			//we need to filter, retrieve all values from PPS
			var out = {};
			var keys = Object.keys(_readerPPS.ppsObj);

			//iterate through the values in PPS
			for (var i = 0; i < keys.length; i++) {

				//separate the setting from the zone
				var splitKey = keys[i].split('_');	// 0 = setting, 1 = zone
				
				//apply the setting filter
				if (doSettingFilter && settings.indexOf(splitKey[0]) < 0) {
					continue;
				}

				//apply the zone filter
				if (doZoneFilter && zones.indexOf(splitKey[1]) < 0) {
					continue;
				}

				//if we get here, the value passed both filters
				out[keys[i]] = _readerPPS.ppsObj[keys[i]]

			}
			//return all filtered values
			return dataFormat(out);
		} else {
			//no filter applied, return all values
			return dataFormat(_readerPPS.ppsObj);
		}
	},
	
	/**
	 * Sets an HVAC setting
	 * @param setting {String} The car.hvac.HvacSetting value
	 * @param zone {String} The car.zones.Zone value
	 * @param value {Mixed} The value for the specified setting in the specified zone
	 */
	set: function(setting, zone, value) {
		if (typeof setting 	== 'string' &&
			typeof zone 	== 'string' &&
			typeof value 	!= 'undefined') 
		{
			//write data to pps
			var data = {};
			data[setting + '_' + zone] = value;
			_writerPPS.write(data);
		}
	}
};
