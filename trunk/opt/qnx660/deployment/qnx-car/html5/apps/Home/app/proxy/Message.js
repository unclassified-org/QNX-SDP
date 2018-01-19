/**
 * A store used to show the address book
 * @author lgreenway
 *
 * $Id: Message.js 4467 2012-09-30 00:43:20Z lgreenway@qnx.com $
 */
Ext.define('Home.proxy.Message', {
	extend: 'Ext.data.proxy.Proxy',
	alias: ['proxy.qnx.message'],

	config: {
		// TODO: Have this done via store filters
		filterExpression: null,
	},

	create: function(operation, callback, scope) {
		operation.setException('Create not supported.');
		operation.setCompleted();
	},

	read: function(operation, callback, scope) {
		// Get the messages from the extension
		// TODO: Support sort params
		var remoteMessages = qnx.message.find((this.getFilterExpression() || null), 'datetime', null, operation.getLimit(), operation.getStart());
		
		// Create model objects
		var messages = [];
		for(var i = 0; i < remoteMessages.length; i++) {
			messages.push(new (this.getModel())(remoteMessages[i]));
		}

		// Set the operation result set to the message model objects
		// Note that if we had sufficient information, we could also set a 'total'
		// property on the result set object that indicates exactly how many records
		// there are in the full result set. This will affect how the data list is
		// rendered, and how the listpaging plugin behaves. Omitting this information
		// simply means that the listpaging plugin will attempt to load pages even if
		// the full result set has been exhausted.
		operation.setResultSet(Ext.create('Ext.data.ResultSet', {
			records: messages,
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