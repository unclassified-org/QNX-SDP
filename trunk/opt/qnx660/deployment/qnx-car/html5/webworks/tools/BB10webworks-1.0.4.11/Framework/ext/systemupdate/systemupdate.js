/**
 * The abstraction layer for software updates functionality
 *
 * @author mlytvynyuk
 * $Id: systemupdate.js 4413 2012-09-29 14:25:59Z mlytvynyuk@qnx.com $
 */

var _pps = require('../../lib/pps/ppsUtils'),
	_controlPPS,
	_statusPPS,
	_updateAvailable

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Initializes the extension,
	 * open and initialise required PPS object and event handlers
	 */

	init:function () {

		/* Initialise PPS object to send commands and data to updateMgr */
		_controlPPS = _pps.createObject();
		_controlPPS.init();
		_controlPPS.open("/pps/services/update/control", JNEXT.PPS_RDWR);

		/* Initialise PPS object responsible for notifying updateMgr state changes */
		_statusPPS = _pps.createObject();
		_statusPPS.init();
		_statusPPS.onReady = _statusPPS.onChange = function (event) {
			if (event && event.data && typeof(event.data.updateAvailable) != "undefined") {
				if (event.data.updateAvailable) {
					var ev = {updateAvailable:true,
						updateDetails: {
								sourceVersion:event.data.updateDetails.sourceVersion,
								targetVersion:event.data.updateDetails.targetVersion,
								source:event.data.updateDetails.source
						},
						error:event.data.updateError};
					_updateAvailable(ev);
				}
				if (!event.data.updateAvailable) {
					var ev = {updateAvailable:false,error:event.data.updateError};
					_updateAvailable(ev);
				}
			}
		};
		_statusPPS.open("/pps/services/update/status", JNEXT.PPS_RDONLY);
	},
	/**
	 * Sets the trigger function to call when a update available event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setUpdateAvailableTrigger:function (trigger) {
		_updateAvailable = trigger;
	},

	/**
	 * Checks for a new software update
	 * First chech if currently any updates availabel, if yes fire an event
	 * if no, command updateMgr to perfom check for update
	 */
	checkForUpdate:function () {
		if (_statusPPS && _statusPPS.ppsObj && typeof _statusPPS.ppsObj.updateAvailable != undefined && _statusPPS.ppsObj.updateAvailable == 1 && _statusPPS.ppsObj.updateDetails) {
			var event = {updateAvailable:true,
				updateDetails: {
					sourceVersion:_statusPPS.ppsObj.updateDetails.sourceVersion,
					targetVersion:_statusPPS.ppsObj.updateDetails.targetVersion,
					source:_statusPPS.ppsObj.updateDetails.source
				},
				error:_statusPPS.ppsObj.updateError};
			// Update available, fire event immediately
			_updateAvailable(event);
		} else {
			// no update available, request updateMgr to check if there anything new
			_controlPPS.write({
				"[n]cmd":1 // Command to check for update
			});
		}
	},

	/**
	 * Initiates update to the latest available software
	 * Sends command to the updateMgr to start update procedure
	 * Will proceed with software update procedure, and reboot the system in order to boot in update IFS
	 */
	performUpdate:function () {
		_controlPPS.write({
			"[n]cmd":2 // Command to initiate update
		});
	}
};
