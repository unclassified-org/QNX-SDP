/**
 * The abstraction layer for mixer functionality
 *
 * @author mlapierre
 * $Id: audiomixer.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var	_pps = require('../../lib/pps/ppsUtils'),
	_mixerReaderPPS,
	_mixerWriterPPS,
	_volumeReaderPPS,
	_volumeWriterPPS,
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
		out.push({ setting: keys[i], zone: 'all', value: data[keys[i]] });
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
		//audio mixer reader
		_mixerReaderPPS = _pps.createObject();
		_mixerReaderPPS.init();
		_mixerReaderPPS.onChange = function(event) {
			if (_triggerUpdate && event && event.data) {
				_triggerUpdate(dataFormat(event.data));
			}
		};
		_mixerReaderPPS.open("/pps/services/audio/mixer", JNEXT.PPS_RDONLY);

		//audio mixer writer
		_mixerWriterPPS = _pps.createObject();
		_mixerWriterPPS.init();
		_mixerWriterPPS.open("/pps/services/audio/mixer", JNEXT.PPS_WRONLY);

		//volume reader
		_volumeReaderPPS = _pps.createObject();
		_volumeReaderPPS.init();
		_volumeReaderPPS.onChange = function(event) {
			if (_triggerUpdate && event && event.data && !isNaN(event.data["output.speaker.volume"])) {
				_triggerUpdate(dataFormat({ volume: event.data["output.speaker.volume"] }));
			}
		};
		_volumeReaderPPS.open('/pps/services/audio/status', JNEXT.PPS_RDONLY);

		//volume writer
		_volumeWriterPPS = _pps.createObject();
		_volumeWriterPPS.init();
		_volumeWriterPPS.open("/pps/services/audio/control", JNEXT.PPS_WRONLY);

	},
	
	/**
	 * Sets the trigger function to call when a mixer event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setTriggerUpdate: function(trigger) {
		_triggerUpdate = trigger;
	},
	
	/**
	 * Return the audio mixer settings for a specific zone
	 * @param {String} zone (Optional) The Zone to filter the results by
	 * @returns {Object} The requested settings
	 */
	get: function(zone) {

		//aggregate mixer and volume
		var out = _mixerReaderPPS.ppsObj;
		out.volume = _volumeReaderPPS.ppsObj["output.speaker.volume"];

		return dataFormat(out);
	},	
	/**
	 * Sets one or more audio parameters
	 * @param {String} setting A car.audiomixer.AudioMixerSetting value   
	 * @param {String} zone A car.Zone value   
	 * @param {Number} value The value to save
	 */
	set: function(setting, zone, value) {
		if (typeof setting == 'string' &&
			typeof zone == 'string' && 
			typeof value == 'number') {

			if (setting == 'volume') {
				if (!isNaN(value) && value >= 0 && value <= 100) {
					_volumeWriterPPS.write({
						id: 4,
						msg: "set_output_level", 
						dat: { 
							ctxt: 0, 
							output_id: 0, 
							level: value 
						}
					});
				}
			} else {
				var data = {};
				data[setting] = value;
				_mixerWriterPPS.write(data);
			}
		}
	},
};
