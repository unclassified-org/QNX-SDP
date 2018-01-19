/**
 * The controller responsible for managing Address Book integration with the qnx.bluetooth.pbap extension.
 * @author lgreenway
 *
 * $Id: AddressBook.js 7261 2013-09-26 14:53:11Z mlapierre@qnx.com $
 */
Ext.define('Communication.controller.AddressBook', {
	extend: 'Ext.app.Controller',

	/**
	 * Convenience reference to the address book store.
	 */
	addressBookStore: null,
	
	/**
	 * Method called when app is ready to launch.
	 */
	launch: function() {
		// Get the reference to the address book store
		this.addressBookStore = Ext.getStore('AddressBook');
		
		// Application event handlers
		this.getApplication().on({
			refresh_contacts: this.refreshContacts,
			scope: this
		});

		if (window.cordova) {
			// Create handler for updates to the address book status (busy, ready, etc)
			document.addEventListener('bluetoothpbapstatechange', this.onContactServiceStateChanged.bind(this));
			
			// Create handlers for status changes
			document.addEventListener('bluetoothpbapstatuschange', this.onContactServiceStatusChanged.bind(this));

		} else {
			// Create handler for updates to the address book status (busy, ready, etc)
			blackberry.event.addEventListener('bluetoothpbapstatechange', this.onContactServiceStateChanged.bind(this));
			
			// Create handlers for status changes
			blackberry.event.addEventListener('bluetoothpbapstatuschange', this.onContactServiceStatusChanged.bind(this));
		}
		
		// Check immediately if the phone book is available and ready
		this.onContactServiceStateChanged(qnx.bluetooth.pbap.getState());
		this.onContactServiceStatusChanged(qnx.bluetooth.pbap.getStatus());
	},
	
	/**
	 * qnx.bluetooth.pbap state change handler. Responsible for managing the availability of the address book
	 * menu items throughout the application, and refreshing the contacts on initial connect.
	 * @param state {Object} The Bluetooth PBAP service state.
	 */
	onContactServiceStateChanged: function(state) {
		if(state && state === qnx.bluetooth.pbap.STATE_CONNECTED) {
			// Make the address book menu items available
			this.setAddressBookAvailable(true);
		} else {
			// Anything but STATE_CONNECTED means the address book is not available
			this.setAddressBookAvailable(false);
		}
	},

	/**
	 * qnx.bluetooth.pbap status change handler.
	 * @param status {Object} The contact service status event.
	 */
	onContactServiceStatusChanged: function(status) {
		if(status) {
			if(status === qnx.bluetooth.pbap.STATUS_REFRESHING) {
				// Remove existing items from the store
				this.addressBookStore.removeAll();

				// Fire event notifying application that contacts are refreshing
				this.getApplication().fireEvent('contacts_refreshing');
			} else if(status === qnx.bluetooth.pbap.STATUS_READY) {
				// Load the first page of data
				this.addressBookStore.removeAll();
				this.addressBookStore.loadPage(1);

				// Remove the loading mask
				Ext.Viewport.setMasked(false);
			} else if(status === qnx.bluetooth.pbap.STATUS_ERROR) {
				// Show a dialog with the error message
				Ext.Msg.alert('Failed to Refresh Contacts', 'An error occurred when attempting to refresh contacts.'); // TODO: i18n
				
				// Remove the loading mask
				Ext.Viewport.setMasked(false);
			}
		}
	},

	/**
	 * Sets address book navigation item availability.
	 * @param available {Boolean} True to enable address book menu items, false to disable.
	 */
	setAddressBookAvailable: function(available) {
		// Menu item
		Ext.getStore('MainMenu').findRecord('type', 'addressbook').set('available', available);

		// Home item
		Ext.getStore('HomeItems').findRecord('cls', 'home-addressbook').set('available', available);
	},
	
	/**
	 * Requests a refresh of contacts from the Bluetooth device.
	 */
	refreshContacts: function() {
		// Prevent the application from being interacted with during the refresh
		Ext.Viewport.setMasked({ xtype: 'loadmask', message: 'Refreshing contacts...' });
		
		// Send the refresh command
		qnx.bluetooth.pbap.refresh();
	},

});
