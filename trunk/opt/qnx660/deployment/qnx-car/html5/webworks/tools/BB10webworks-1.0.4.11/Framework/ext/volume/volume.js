/**
* The abstraction layer for volume functionality
 *
 * @author mlapierre
 * $Id: volume.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var	_pps = require('../../lib/pps/ppsUtils'),
	_statusPPS,
	_controlPPS,
	_trigger;

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Initializes the extension 
	 */
	init: function() {
		//statusPPS
		_statusPPS = _pps.createObject();
		_statusPPS.init();
		_statusPPS.onChange = function(event) {
			if (_trigger && event && event.data && !isNaN(event.data["output.speaker.volume"])) {
				_trigger({ volume: event.data["output.speaker.volume"] });
			}
		};
		_statusPPS.open('/pps/services/audio/status', JNEXT.PPS_RDONLY);

		//controlPPS
		_controlPPS = _pps.createObject();
		_controlPPS.init();
		_controlPPS.open("/pps/services/audio/control", JNEXT.PPS_WRONLY);
	},
	
	/**
	 * Sets the trigger function to call when a volume event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setTrigger: function(trigger) {
		_trigger = trigger;
	},
	
	/**
	 * Returns the current volume
	 * @returns {Number} The current audio parameters
	 */
	get: function() {
		return _statusPPS.ppsObj["output.speaker.volume"];
	},
	
	/**
	 * Sets the volume
	 * @param volume {Number} The new volume to set
	 */
	set: function(volume) {
		//write volume to pps
		if (!isNaN(volume) && volume >= 0 && volume <= 100) {
			_controlPPS.write({
				id: 4,
				msg: "set_output_level", 
				dat: { 
					ctxt: 0, 
					output_id: 0, 
					level: volume 
				}
			});
		}
	},
};
