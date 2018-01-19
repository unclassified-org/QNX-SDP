/**
 * The AddressBook store proxy configured to load contact synchronized via PBAP
 * through the qnx.bluetooth.pbap extension.
 * 
 * @author lgreenway
 *
 * $Id: AddressBook.js 6848 2013-07-16 21:53:46Z mlytvynyuk@qnx.com $
 */
Ext.define('Communication.proxy.AddressBook', {
	extend: 'Ext.data.proxy.Proxy',
	alias: ['proxy.qnx.addressBook'],

	config: {
		// TODO: Have this done via store filters
		filterExpression: null,
	},

	getSorter: function(operation) {
		var filter = {};
		
		// only gets the first sorter
		if (operation.getSorters()[0].getProperty()) {
			filter.property = operation.getSorters()[0].getProperty();
			filter.isAscending = (operation.getSorters()[0].getDirection() === 'ASC') ? true : false;
		}
		return filter;
	},

	create: function(operation, callback, scope) {
		operation.setException('Create not supported.');
		operation.setCompleted();
	},

	read: function(operation, callback, scope) {
		// Get the contacts from the extension
		var remoteContacts = qnx.bluetooth.pbap.find((this.getFilterExpression() || null), null, null, null,null);
		
		// Create model objects from the results
		var contacts = [];
		for(var i = 0; i < remoteContacts.length; i++) {
			contacts.push(new (this.getModel())(remoteContacts[i]));
		}

		// Set the operation result set to the message model objects
		// Note that if we had sufficient information, we could also set a 'total'
		// property on the result set object that indicates exactly how many records
		// there are in the full result set. This will affect how the data list is
		// rendered, and how the listpaging plugin behaves. Omitting this information
		// simply means that the listpaging plugin will attempt to load pages even if
		// the full result set has been exhausted.
		operation.setResultSet(Ext.create('Ext.data.ResultSet', {
			records: contacts,
		}));
		
		// Set the operation as successful and completed
		operation.setSuccessful();
		operation.setCompleted();
		
		// Finally, call the success callback
		if(typeof callback === 'function') {
			callback.call(scope || this, operation);
		}
	},
	
	update: function(operation, callback, scope) {
		operation.setException('Updated not supported.');
		operation.setCompleted();
	},
	
	destroy: function(operation, callback, scope) {
		operation.setException('Destroy not supported.');
		operation.setCompleted();
    },

});