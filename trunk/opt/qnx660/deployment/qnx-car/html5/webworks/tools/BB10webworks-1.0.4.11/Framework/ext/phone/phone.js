/**
 * The abstraction layer for HFP functionality,
 * at the moment this is only one default implementation
 * @author mlytvynyuk
 * $Id: phone.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _pps = require('../../lib/pps/ppsUtils'),
	_hfpControlPPS,
	_phoneReadyTrigger,
	_phoneDialingTrigger,
	_phoneIncomingTrigger,
	_phoneCallActiveTrigger

var lastNumber = null;
var callId = null;

/**
 * phone status, indicates that Handsfree is up and running but not connected to any particular device
 * */
var HFP_INITIALIZED = "HFP_INITIALIZED";
/**
 * Handsfree status, indicates that Handsfree is successfully connected to the device
 * */
var HFP_CONNECTED_IDLE = "HFP_CONNECTED_IDLE";
/**
 * Handsfree status, indicates that Handsfree is dialing out
 * */
var HFP_CALL_OUTGOING_DIALING = "HFP_CALL_OUTGOING_DIALING";
/**
 * phone status, indicates that there is active phone call at the moment
 * */
var HFP_CALL_ACTIVE = "HFP_CALL_ACTIVE";
/**
 * Handsfree status, indicates that there is incoming call
 * */
var HFP_CALL_INCOMING = "HFP_CALL_INCOMING";

/**
 * Defines identifier for HFP service
 * */
var SERVICE_HFP = "SERVICE_HFP";

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Initializes the extension
	 */
	init:function () {
		//readerPPS
		_hfpControlPPS = _pps.createObject();
		_hfpControlPPS.init();

		try{
			_hfpControlPPS.open("/pps/services/handsfree/control", JNEXT.PPS_RDWR);
		} catch (e) {
			throw new Error("qnx.phone::init [phone.js] PPS object /pps/services/handsfree/status cannot be opened")
		}

		_hfpStatusPPS = _pps.createObject();
		_hfpStatusPPS.init();
		_hfpStatusPPS.onChange = function (event) {
			if (event && event.data && event.data.cmd_status) {
				var cmd_status = event.data.cmd_status;
				// TODO Add code to process cmd_status, will fire error event with appropriate message (require extra HFP backend works)
			}

			if (event && event.data && event.data.state) {
				var state = event.data.state;

				switch (state) {
					case HFP_CONNECTED_IDLE:
						if (_phoneReadyTrigger) {
							_phoneReadyTrigger({service:SERVICE_HFP});
						}
						break;
					case HFP_CALL_OUTGOING_DIALING:
						// FIXME: The state_param event property should ALWAYS have the phone number for this event
						callId = event.data.state_param || callId;
						if (_phoneDialingTrigger) {
							_phoneDialingTrigger({service:SERVICE_HFP, callId:callId });
						}
						break;
					case  HFP_CALL_ACTIVE:
						// FIXME: The state_param event property should ALWAYS have the phone number for this event
						callId = event.data.state_param || callId;
						if (_phoneCallActiveTrigger) {
							// specifying service and callId, callId will be populated at this moment
							_phoneCallActiveTrigger({service:SERVICE_HFP, callId:callId });
						}
						break;
					case HFP_CALL_INCOMING:
						// FIXME: The state_param event property should ALWAYS have the phone number for this event
						callId = event.data.state_param || callId;
						if (_phoneIncomingTrigger && callId) {
							_phoneIncomingTrigger({service:SERVICE_HFP, callId:callId })
						}
						break;
				}
			}
		};
		try{
			_hfpStatusPPS.open("/pps/services/handsfree/status", JNEXT.PPS_RDWR);
		} catch (e) {
			throw new Error("qnx.phone::init [phone.js] PPS object /pps/services/handsfree/status cannot be opened.")
		}

	},

	/**
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setPhoneReadyTrigger:function (trigger) {
		_phoneReadyTrigger = trigger;
	},
	/**
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setPhoneDialingTrigger:function (trigger) {
		_phoneDialingTrigger = trigger;
	},
	/**
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setPhoneIncomingTrigger:function (trigger) {
		_phoneIncomingTrigger = trigger;
	},
	/**
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setPhoneCallActiveTrigger:function (trigger) {
		_phoneCallActiveTrigger = trigger;
	},

	/**
	 * Dial a number
	 * @param {String} Number to dial
	 */
	dial:function (number) {
		if(number) {
			// saving outgoing call phone number to be able to redial later
			lastNumber = number;
			// saving outgoing call phone number as callid
			callId = number;
			if (_hfpStatusPPS.ppsObj.state == HFP_CONNECTED_IDLE) {
				_hfpControlPPS.write({
					"command":"HFP_CALL",
					"cmd_data":number
				});
			}
		}
	},

	/**
	 * Accept incoming call
	 */
	accept:function () {
		if (_hfpStatusPPS.ppsObj.state == HFP_CALL_INCOMING) {
			_hfpControlPPS.write({
				"command":"HFP_ACCEPT"
			})
		}
	},

	/**
	 * Hangs up current active call
	 * */
	hangup:function () {
		if (_hfpStatusPPS.ppsObj.state != HFP_CONNECTED_IDLE) {
			_hfpControlPPS.write({
				"command":"HFP_HANGUP"
			});
		}
	},

	/**
	 * Redials last called number
	 * */
	redial:function () {
		if (lastNumber) {
			this.dial(lastNumber);
		}
	},

	/**
	 * Return current state of the phone
	 * We will translate HFP statuses to generic Phone statuses
	 * @returns {String} current state of the phone
	 * */
	getState:function () {
		var state = _hfpStatusPPS.ppsObj.state;
		var result = "";
		switch(state) {
			case HFP_CONNECTED_IDLE: result = "PHONE_IDLE"; break;
			case HFP_CALL_ACTIVE: result = "CALL_ACTIVE"; break;
			case HFP_CALL_INCOMING: result = "CALL_INCOMING"; break;
			default: result = "PHONE_NOT_READY"; break;
		}
		return result;
	}
};