/**
 * The controller handles Dial Pad operations
 * @author mlytvynyuk
 *
 * $Id: DialPad.js 7261 2013-09-26 14:53:11Z mlapierre@qnx.com $
 */
Ext.define('Communication.controller.DialPad', {

	extend: 'Ext.app.Controller',

	config:{
		refs:{
			dialPadView:'dialPadView',
			callBtn: '#callBtn'
		},
		control:{
			callBtn:{
				release:function (e) {
					this.onCall(null);
				}
			},
		}
	},

	activeCallNumber:"",

	/**
	 * Initializes the controller on app startup
	 */
	init: function() {
		this.getApplication().on({
			dialpad_index: this.onDialPadIndex,
			scope: this
		});
		
		if (window.cordova) {
			// Listen for HFP availability
			document.addEventListener('bluetoothserviceconnected', this.onBluetoothServiceConnected.bind(this));
			document.addEventListener('bluetoothservicedisconnected', this.onBluetoothServiceDisconnected.bind(this));

		} else {
			// Listen for HFP availability
			blackberry.event.addEventListener('bluetoothserviceconnected', this.onBluetoothServiceConnected.bind(this));
			blackberry.event.addEventListener('bluetoothservicedisconnected', this.onBluetoothServiceDisconnected.bind(this));
		}
		
		// Check for HFP state immediately
		var connectedDevices = qnx.bluetooth.getConnectedDevices(qnx.bluetooth.SERVICE_HFP);
		if(connectedDevices && connectedDevices[qnx.bluetooth.SERVICE_HFP] && connectedDevices[qnx.bluetooth.SERVICE_HFP].trim() !== '') {
			this.setDialPadAvailable(true);
		}
	},

	/**
	 * To do some work when application laucnhes
	 * */
	launch: function() {
	},

	/**
	 * Shows the dial pad view.
	 * @param e {String} The number to which default the dial pad.
	 */
	onDialPadIndex: function(e) {
		if(e && e.number) {
			this.getDialPadView().setPhoneNumber(e.number);

			if(e.autoDial) {
				this.onCall(e.number);
			}
		}
		
		Ext.Viewport.setActiveItem(this.getDialPadView());
	},
	
	/**
	 * Will active call to the given phone number
	 * @param number {String} phone number to call
	 * */
	onCall: function(number) {
		if(number) {
			this.activeCallNumber = number;
		} else {
			this.activeCallNumber = this.getDialPadView().getPhoneNumber();
		}

		if(this.activeCallNumber && this.activeCallNumber.length > 0 && qnx.phone.getState() == "PHONE_IDLE") {
			qnx.phone.dial(this.activeCallNumber);
		}
	},

	/**
	 * Sets dial pad navigation item availability.
	 * @param available {Boolean} True to enable dial pad menu items, false to disable.
	 */
	setDialPadAvailable: function(available) {
		// Menu item
		Ext.getStore('MainMenu').findRecord('type', 'dialpad').set('available', available);

		// Home item
		Ext.getStore('HomeItems').findRecord('cls', 'home-dialpad').set('available', available);
	},
	
	/**
	 * bluetoothserviceconnected event handler. Enables the dial pad nav items if the HFP service is connected.
	 * @param e {Object} The bluetoothserviceconnected event object.
	 */
	onBluetoothServiceConnected: function(e) {
		if(e && e.serviceid &&
				(e.serviceid == qnx.bluetooth.SERVICE_HFP || e.serviceid == qnx.bluetooth.SERVICE_ALL))
		{
			this.setDialPadAvailable(true);
		}
	},
	
	/**
	 * bluetoothservicedisconnected event handler. Disables the dial pad nav items if the HFP service is disconnected.
	 * @param e {Object} The bluetoothservicedisconnected event object.
	 */
	onBluetoothServiceDisconnected: function(e) {
		if(e && e.serviceid &&
				(e.serviceid == qnx.bluetooth.SERVICE_HFP || e.serviceid == qnx.bluetooth.SERVICE_ALL))
		{
			this.setDialPadAvailable(false);
			
			// Show home
			this.getApplication().fireEvent('home_index');
		}
	}
	
	
});