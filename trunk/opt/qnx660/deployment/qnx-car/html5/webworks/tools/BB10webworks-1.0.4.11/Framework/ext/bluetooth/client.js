/**
 * Manage Bluetooth operations
 *
 * <h3>Search Events</h3>
 * 
 * <dl><dt><h4>bluetoothnewdevice</h4></dt>
 * <dd><p>When new device found, event contains object representing found device</p>
 * <h5>Event data</h5>
 * <p>callback parameter {Object}</p>
 * <h5>Example</h5>
 * <pre><code>{
 *      mac:{String},           //MAC address of the device
 *      ccod:{String},          //Class Of Device, describes device capabilities
 *      name:{String},          //device name
 *      paired:{Boolean},       //indicates if device paired, true if paired
 *      rssi:{String}           //Received signal strength indication, value indicates power present in a received radio signal for given device
 * }</code></pre></dd></dl>
 *
 * <dl><dt><h4>bluetoothsearchcomplete</h4></dt>
 * <dd><p>When Search is completed</p></dd></dl>
 *
 * <dl><dt><h4>bluetoothsearchcancelled</h4></dt>
 * <dd><p>When Search is cancelled</p></dd></dl>
 *
 * <h3>Pairing events</h3>
 *
 * <dl><dt><h4>bluetoothpairingcomplete</h4></dt>
 * <dd><p>Indicates that pairing with <code>device</code> successful</p>
 * <h5>Event data</h5>
 * <p>callback parameter {String}</p>
 * <h5>Example</h5>
 * <pre><code>mac:{String}		//MAC address of the device</code></pre></dd></dl>
 *
 * <dl><dt><h4>bluetoothinitpairingfail</h4></dt>
 * <dd><p>Indicate that pairing failed</p>
 * <h5>Event data</h5>
 * <p>callback parameter {String}</p>
 * <h5>Example</h5>
 * <pre><code>mac:{String}		//MAC address of the device</code></pre></dd></dl>
 *
 * <dl><dt><h4>bluetoothinitpairingsuccess</h4></dt>
 * <dd><p>Indicate that the initialization of the pairing process successful</p>
 * <h5>Event data</h5>
 * <p>callback parameter {String}</p>
 * <h5>Example</h5>
 * <pre><code>mac:{String}		//MAC address of the device</code></pre></dd></dl>
 *
 * <dl><dt><h4>bluetoothpairingfailed</h4></dt>
 * <dd><p>Indicate that the initialization of the pairing process failed</p>
 * <h5>Event data</h5>
 * <p>callback parameter {String}</p>
 * <h5>Example</h5>
 * <pre><code>mac:{String}		//MAC address of the device</code></pre></dd></dl>
 *
 * <dl><dt><h4>bluetoothpairingcancelled</h4></dt>
 * <dd><p>Indicate that pairing is cancelled</p>
 * <h5>Event data</h5>
 * <p>callback parameter {String}</p>
 * <h5>Example</h5>
 * <pre><code>mac:"{String}		//MAC address of the device</code></pre></dd></dl>

 * <dl><dt><h4>bluetoothauthrequest</h4></dt>
 * <dd><p>Indicate an incoming authorization request</p>
 * <h5>Event data</h5>
 * <p>callback parameter {Object}</p>
 * <h5>Example</h5>
 * <pre><code>{
 *      mac:{String},           //MAC address of the device
 *      type:{String},          //contains type of the authorization request, one of public constants <code>LEGACY_PIN</code>, <code>AUTHORIZE</code>, <code>PASS_KEY</code>, <code>ACCEPT_PASS_KEY</code>, <code>DISPLAY_PASS_KEY</code>
 *      passkey:{String}        //[Optional] if type = <code>ACCEPT_PASS_KEY</code>, <code>DISPLAY_PASS_KEY</code> contains passkey to display, otherwise undefined
 *}</code></pre></dd></dl>
 *
 * <dl><dt><h4>bluetoothcommandfailed</h4></dt>
 * <dd><p>Indicates that current command failed</p></dd></dl>
 * 
 * <dl><dt><h4>bluetoothnewpaireddevice</h4></dt>
 * <dd><p>When device paired</p>
 * <h5>Event data</h5>
 * <p>callback parameter {Object}</p>
 * <h5>Example</h5>
 * <pre><code>{
 *      mac:{String},           //MAC address of the device
 *      ccod:{String},          //Class Of Device, describes device capabilities
 *      name:{String},          //device name
 *      paired:{Boolean},       //indicates if device paired, true if paired
 *      rssi:{String}           //Received signal strength indication, value indicates power present in a received radio signal for given device
 *}</code><pre></dd></dl>
 *
 * <h3>Other events</h3>
 *
 * <dl><dt><h4>commandfailed</h4>
 * <dd><p>Triggered when command failed</p></dd></dl>
 *
 * <dl><dt><h4>bluetoothcommandbusy</h4></dt>
 * <dd><p>Triggered when Bluetooth stack busy</p><dd></dl>
 * 
 * <dl><dt><h4>bluetoothserviceconnected</h4></dt>
 * <dd><p>Triggered when service connected</p>
 * <h5>Event data</h5>
 * <p>callback parameter {Object}</p>
 * <h5>Example</h5>
 * <pre><code>{
 *      mac:{String},           //MAC address of the device
 *      serviceid:{String}      //contains string representing Bluetooth service ID
 *} </code></pre></dd></dl>
 *
 * <dl><dt><h4>bluetoothserviceconnectfailed</h4></dt>
 * <dd><p>Triggered when service connect failed</p>
 * <h5>Event data</h5>
 * <p>callback parameter {Object}</p>
 * <h5>Example</h5>
 * <pre><code>{
 *      mac:{String},           //MAC address of the device
 *      serviceid:{String}      //contains string representing Bluetooth service ID
 *} </code></pre></dd></dl>
 *
 * <dl><dt><h4>bluetoothservicedisconnected</h4></dt>
 * <dd><p>Triggered when service disconnected, event provides MAC address</p>
 * <h5>Event data</h5>
 * <p>callback parameter {Object}</p>
 * <h5>Example</h5>
 * <pre><code>{
 *      mac:{String},           //MAC address of the device
 *      serviceid:{String}      //contains string representing Bluetooth service ID
 *} </code></pre></dd></dl>
 *
 * <dl><dt><h4>bluetoothpaireddevicedeleted</h4></dt>
 * <dd><p>Triggered when paired device deleted successfully</p>
 * <h5>Event data</h5>
 * <p>callback parameter {String}</p>
 * <h5>Example</h5>
 * <pre><code>      mac:{String}        //MAC address of the device</code></pre></dd></dl>
 *
 * <dl><dt><h4>bluetoothpaireddevicedeletefailed</h4></dt>
 * <dd><p>Triggered when paired device delete failed</p>
 * <h5>Event data</h5>
 * <p>callback parameter {String}</p>
 * <h5>Example</h5>
 * <pre><code>      mac:{String}        //MAC address of the device</code></pre></dd></dl>
 *
 * <dl><dt><h4>bluetoothaclconnected</h4></dt>
 * <dd><p>Triggered when a low-level (ACL) connection has been established with a remote device.</p>
 * <h5>Event data</h5>
 * <p>callback parameter {String}</p>
 * <h5>Example</h5>
 * <pre><code>      mac:{String}        //MAC address of the device</code></pre></dd></dl>
 *
 * @module qnx_xyz_bluetooth
 */
 
 /*
 * @author mlapierre, mlytvynyuk
 * $Id: client.js 4348 2012-09-28 18:05:29Z mlytvynyuk@qnx.com $
 */

var _ID = require("./manifest.json").namespace;

/*
 * Exports are the publicly accessible functions
 */
module.exports = {

	/* TODO Please make sure that constants below are identical to ones in bluetooth.js*/
	/** To exchange legacy PIN (usually hardcoded) */
	LEGACY_PIN:"LEGACY_PIN",
	/** To allow remote device connect. */
	AUTHORIZE:"AUTHORIZE",
	/** Request to display dialog to enter authorization passkey */
	PASS_KEY:"PASS_KEY",
	/** Request to display dialog to confirm displayed  passkey*/
	ACCEPT_PASS_KEY:"ACCEPT_PASS_KEY",
	/** Request to display dialog display passkey*/
	DISPLAY_PASS_KEY:"DISPLAY_PASS_KEY",
	/** Defines Handsfree Profile ID */
	SERVICE_HFP:"0x111E",
	/** Defines Message Access Profile ID */
	SERVICE_MAP:"0x1134",
	/** Defines Serial Port Profile ID */
	SERVICE_SPP:"0x1101",
	/** Defines Phonebook Access Profile ID */
	SERVICE_PBAP:"0x1130",
	/** Defines Personal Area Network ID */
	SERVICE_PAN : "0x1115",
	/** Defines Advanced Audio Distribution Profile / Audio/Video Remote Control Profile ID */
	SERVICE_AVRCP : "0x110B",
	/** Defines all allowed Profile ID for current device*/
	SERVICE_ALL:"ALL",

	/** Not discoverable or connectable. */
	DEVICE_NOT_ACCESSIBLE:0,
	/** General discoverable and connectable. */
	DEVICE_GENERAL_ACCESSIBLE:1,
	/** Limited discoverable and connectable. */
	DEVICE_LIMITED_ACCESSIBLE:2,
	/** Connectable but not discoverable. */
	DEVICE_CONNECTABLE_ONLY:3,
	/** Discoverable but not connectable. */
	DEVICE_DISCOVERABLE_ONLY:4,

	/* TODO Please make sure that constants above are identical to ones in bluetooth.js*/

	/**
	 * Set the Bluetooth name of the device
	 * @param {String} name The name to set
	 */
	setName:function (name) {
		window.webworks.execSync(_ID, 'setName', {name:name});
	},

	/**
	 * Set the Bluetooth device accessibility mode
	 * @param {Number} mode The value of the accessibility mode <code>DEVICE_NOT_ACCESSIBLE, DEVICE_GENERAL_ACCESSIBLE, DEVICE_LIMITED_ACCESSIBLE, DEVICE_CONNECTABLE_ONLY, DEVICE_DISCOVERABLE_ONLY</code>
	 */
	setAccessibilityMode:function (mode) {
		window.webworks.execSync(_ID, 'setAccessibilityMode', {mode:mode});
	},

	/**
	 * Initiate the search for Bluetooth devices.
	 */
	search:function () {
		window.webworks.execAsync(_ID, 'search');
	},

	/**
	 * Cancel a search in progress
	 */
	cancelSearch:function () {
		window.webworks.execAsync(_ID, 'cancelSearch');
	},

	/**
	 * Initiate pairing to a Bluetooth device
	 * @param {String} mac MAC address of the device
	 */
	pair:function (mac) {
		window.webworks.execAsync(_ID, 'pair', { mac:mac });
	},

	/**
	 * Cancel a pairing operation in progress
	 * @param {String} mac MAC address of the device
	 */
	cancelPair:function (mac) {
		window.webworks.execAsync(_ID, 'cancelPair', { mac:mac });
	},

	/**
	 * Send authorization information to the BT stack.
	 * @param {String} mac MAC address of the device
	 * @param {Object} parameters Parameters of the authorization response
	 * @example
	 *{
	 *     type: {String}      //indicates type of the authorizations
	 *     response: {String}  //data passed for authorizations response
	 * }
	 */
	saveDevice:function (mac, parameters) {
		window.webworks.execAsync(_ID, 'saveDevice', { mac:mac, parameters:parameters });
	},

	/**
	 * Return Bluetooth settings, reading from PPS
	 * @param {Array} settings [optional] A list of settings to get; if omitted, all are returned
	 * @return {Object} The requested settings
	 * @example
	 *{
	 *     accessibility:{Number},             //defines if host Bluetooth device will be visible to others
	 *     active_connections:{Boolean},       //indicated if there is any active connection established, true if connection established
	 *     btaddr:{String},                    //provides MAC address of host Bluetooth adapter
	 *     enabled:{Boolean},                  //defines if Bluetooth is enabled and operational, true if operational
	 *     name:{String},                      //defines Bluetooth device name which will be visible to others
	 *     running:{Boolean},                  //indicated if Bluetooth stack is up and running, true if running
	 *     sapphire_device:{String},           //indicates MAC address of the device currently connected via Bridge
	 *     sapphire_device_p:{String},         //indicates MAC address of the device currently connected via Bridge
	 *     sapphire_enabled:{Boolean}          //indicates if BlackBerry Bridge connected via SPP profile, true if connected
	 *}
	 */
	getOptions:function (settings) {
		if (settings) {
			return window.webworks.execSync(_ID, 'getOptions', { settings:settings });
		} else {
			return window.webworks.execSync(_ID, 'getOptions');
		}
	},

	/**
	 * Save Bluetooth settings to PPS
	 * @param {Object} settings Bluetooth settings to set
	 * @example
	 * {
	 *     accessibility:{Number},             //defines if host Bluetooth device will be visible to others
	 *     active_connections:{Boolean},       //indicated if there is any active connection established, true if connection established
	 *     btaddr:{String},                    //provides MAC address of host Bluetooth adapter
	 *     enabled:{Boolean},                  //defines if Bluetooth is enabled and operational, true if operational
	 *     name:{String},                      //defines Bluetooth device name which will be visible to others
	 *     running:{Boolean},                  //indicated if Bluetooth stack is up and running, true if running
	 *     sapphire_device:{String},           //indicates MAC address of the device currently connected via Bridge
	 *     sapphire_device_p:{String},         //indicates MAC address of the device currently connected via Bridge
	 *     sapphire_enabled:{Boolean}          //indicates if BlackBerry Bridge connected via SPP profile, true if connected
	 * }
	 */
	setOptions:function (settings) {
		window.webworks.execSync(_ID, 'setOptions', {settings:settings});
	},

	/**
	 * Connect to specified service on device with specified MAC address
	 * @param {String} service Service identifier
	 * @param {String} mac MAC address of the device
	 * */
	connectService:function (service, mac) {
		window.webworks.execAsync(_ID, 'connectService', {service:service, mac:mac});
	},

	/**
	 * Disconnect from specified service on device with specified MAC address
	 * @param {String} service Service identifier
	 * @param  {String} mac MAC address of the device
	 * */
	disconnectService:function (service, mac) {
		window.webworks.execAsync(_ID, 'disconnectService', {service:service, mac:mac});
	},

	/**
	 * Get a list of connected devices for Bluetooth services
	 * @param {String} service [optional] The Bluetooth service (e.g. SERVICE_HFP)
	 */
	getConnectedDevices:function (service) {
		return window.webworks.execSync(_ID, 'getConnectedDevices', {service: service || null});
	},

	/**
	 * Remove a paired device and revoke its authorization to pair
	 * @param {Object} mac MAC address of the Bluetooth device in question
	 */
	removeDevice:function (mac) {
		window.webworks.execAsync(_ID, 'removeDevice', {mac:mac});
	},

	/**
	 * Return a list of paired devices
	 * @return {Object} The currently paired device, or null
	 */
	getPaired:function () {
		return window.webworks.execSync(_ID, 'getPaired');
	},

	/**
	 * Get a list of available Bluetooth services for a device
	 * @param {String} mac MAC address of the device
	 */
	getServices:function (mac) {
		return window.webworks.execAsync(_ID, 'getServices', {mac:mac});
	}
};