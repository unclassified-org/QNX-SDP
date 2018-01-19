/**
 * The abstraction layer for power manager functionality
 *
 * @author mlytvynyuk
 * $Id: power.js 4886 2012-11-05 20:22:28Z mlytvynyuk@qnx.com $
 */

var _pps = require('../../lib/pps/ppsUtils'),
	_controlPPS;

var SHUTDOWN = "shutdown";

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Initializes the extension
	 */
	init:function () {
		try {
			_controlPPS = _pps.createObject();
			_controlPPS.init();
			_controlPPS.init();
			_controlPPS.open("/pps/services/power/shutdown/control", JNEXT.PPS_RDWR);
		} catch (ex) {
			var err = 'qnx.power::init [power.js] Error opening /pps/services/power/shutdown/control';
			console.error(err);
			throw new Error(err);
		}
	},

	/**
	 * Sends the shutdown command to the PPS
	 * @param reason {String} - shutdown reason
	 * @param fast {String} 1 - fast reboot without logging, 0 - slow with logging
	 * */
	shutdown:function (reason, fast) {
		if (reason != null && fast != null) {
			var payload = {
				msg:SHUTDOWN,
				id:"1",
				dat:{"shutdownType":"0", "reason":reason, "fast":fast}
			}
			_controlPPS.write(payload);
		} else {
			var err = 'qnx.power::shutdown [power.js] Required parameters are null';
			console.error(err);
			throw new Error(err);
		}
	},

	/**
	 * Sends the reboot command to the PPS
	 * @param reason {String} - shutdown reason
	 * @param fast {String} 1 - fast reboot without logging, 0 - slow with logging
	 * */
	reboot:function (reason, fast) {
		if (reason != null && fast != null) {
			var payload = {
				msg:SHUTDOWN,
				id:"1",
				dat:{"shutdownType":"1", "reason":reason, "fast":fast}
			}
			_controlPPS.write(payload);
		} else {
			var err = 'qnx.power::reboot [power.js] Required parameters are null';
			console.error(err);
			throw new Error(err);
		}
	}
};
