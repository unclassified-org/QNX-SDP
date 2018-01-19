/**
 * The event context for Bluetooth events
 *
 * @author  mlapierre, mlytvynyuk
 * $Id: context.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _bluetooth = require("./bluetooth");

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Method called when the first listener is added for an event
	 * @param event {String} The event name
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	addEventListener:function (event, trigger) {
		if (event && trigger) {
			switch (event) {
				case "bluetoothnewdevice":
					_bluetooth.setNewDeviceTrigger(trigger);
					break;
				case "bluetoothnewpaireddevice":
					_bluetooth.setNewPairedDeviceTrigger(trigger);
					break;
				case "bluetoothpairingcomplete":
					_bluetooth.setPairingCompleteTrigger(trigger);
					break;
				case "bluetoothsearchcomplete":
					_bluetooth.setSearchCompleteTrigger(trigger);
					break;
				case "bluetoothsearchcancelled":
					_bluetooth.setSearchCancelledTrigger(trigger);
					break;
				case "bluetoothsearchstartfailed":
					_bluetooth.setSearchStartFailedTrigger(trigger);
					break;
				case "bluetoothpairingfailed":
					_bluetooth.setPairingFailedTrigger(trigger);
					break;
				case "bluetoothpairingcancelled":
					_bluetooth.setPairingCancelledTrigger(trigger);
					break;
				case "bluetoothinitpairingfail":
					_bluetooth.setInitPairingFailTrigger(trigger);
					break;
				case "bluetoothinitpairingsuccess":
					_bluetooth.setInitPairingSuccessTrigger(trigger);
					break;
				case "bluetoothauthrequest":
					_bluetooth.setAuthRequestTrigger(trigger);
					break;
				case "bluetoothcommandfailed":
					_bluetooth.setCommandFailedTrigger(trigger);
					break;
				case "bluetoothcommandbusy":
					_bluetooth.setCommandBusyTrigger(trigger);
					break;
				case "bluetoothserviceconnected":
					_bluetooth.setServiceConnectedTrigger(trigger);
					break;
				case "bluetoothserviceconnectfailed":
					_bluetooth.setServiceConnectFailedTrigger(trigger);
					break;
				case "bluetoothservicedisconnected":
					_bluetooth.setServiceDisconnectedTrigger(trigger);
					break;
				case "bluetoothservicedisconnectfailed":
					_bluetooth.setServiceDisconnectFailedTrigger(trigger);
					break;
				case "bluetoothpaireddevicedeleted":
					_bluetooth.setDeviceDeletedTrigger(trigger);
					break;
				case "bluetoothpaireddevicedeletefailed":
					_bluetooth.setDeviceDeleteFailedTrigger(trigger);
					break;
				case "bluetoothaclconnected":
					_bluetooth.setAclConnectedTrigger(trigger);
					break;
				case "bluetoothservicestatechanged":
					_bluetooth.setServiceStateChangedTrigger(trigger);
					break;
			}
		}
	},

	/**
	 * Method called when the last listener is removed for an event
	 * @param event {String} The event name
	 */
	removeEventListener:function (event) {
		if (event) {
			switch (event) {
				case "bluetoothnewdevice":
					_bluetooth.setNewDeviceTrigger(null);
					break;
				case "bluetoothnewpaireddevice":
					_bluetooth.setNewPairedDeviceTrigger(null);
					break;
				case "bluetoothpairingcomplete":
					_bluetooth.setPairingCompleteTrigger(null);
					break;
				case "bluetoothsearchcomplete":
					_bluetooth.setSearchCompleteTrigger(null);
					break;
				case "bluetoothsearchcancelled":
					_bluetooth.setSearchCancelledTrigger(null);
					break;
				case "bluetoothsearchstartfailed":
					_bluetooth.setSearchStartFailedTrigger(null);
					break;
				case "bluetoothpairingfailed":
					_bluetooth.setPairingFailedTrigger(null);
					break;
				case "bluetoothpairingcancelled":
					_bluetooth.setPairingCancelledTrigger(null);
					break;
				case "bluetoothinitpairingfail":
					_bluetooth.setInitPairingFailTrigger(null);
					break;
				case "bluetoothinitpairingsuccess":
					_bluetooth.setInitPairingSuccessTrigger(null);
					break;
				case "bluetoothauthrequest":
					_bluetooth.setAuthRequestTrigger(null);
					break;
				case "bluetoothcommandfailed":
					_bluetooth.setCommandFailedTrigger(null);
					break;
				case "bluetoothcommandbusy":
					_bluetooth.setCommandBusyTrigger(null);
					break;
				case "bluetoothserviceconnected":
					_bluetooth.setServiceConnectedTrigger(null);
					break;
				case "bluetoothserviceconnectfailed":
					_bluetooth.setServiceConnectFailedTrigger(null);
					break;
				case "bluetoothservicedisconnected":
					_bluetooth.setServiceDisconnectedTrigger(null);
					break;
				case "bluetoothservicedisconnectfailed":
					_bluetooth.setServiceDisconnectFailedTrigger(null);
					break;
				case "bluetoothpaireddevicedeleted":
					_bluetooth.setDeviceDeletedTrigger(null);
					break;
				case "bluetoothpaireddevicedeletefailed":
					_bluetooth.setDeviceDeleteFailedTrigger(null);
					break;
				case "bluetoothaclconnected":
					_bluetooth.setAclConnectedTrigger(null);
					break;
				case "bluetoothservicestatechanged":
					_bluetooth.setServiceStateChangedTrigger(null);
					break;
			}
		}
	}
};
