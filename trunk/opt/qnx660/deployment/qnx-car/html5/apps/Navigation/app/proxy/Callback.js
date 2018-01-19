/**
 * The abstract callback proxy is used as a superclass for proxies that implement CRUD operations with success and
 * error callbacks.
 * 
 * @author lgreenway
 *
 * $Id: Callback.js 6845 2013-07-16 16:36:59Z lgreenway@qnx.com $
 */
Ext.define('Navigation.proxy.Callback', {
	extend: 'Ext.data.proxy.Proxy',
	alias: ['proxy.callback'],

	initialize: function() {
		this.callParent();
	},

	/**
	 * Performs a create operation.
	 * @param {Ext.data.Operation} operation The Operation to perform
	 * @param {Function} callback Callback function to be called when the Operation has completed (whether successful or not)
	 * @param {Object} scope Scope to execute the callback function in
	 * @method
	 */
	create: function(operation, callback, scope) {
		operation.setException('Create not supported.');
		operation.setCompleted();
		
		if(typeof callback === 'function') {
			callback.call(scope || me, operation);
		}
	},

	/**
	 * Performs a read operation. The implementation of the read function must be overridden in the readFn function
	 * property.
	 * @param {Ext.data.Operation} operation The Operation to perform
	 * @param {Function} callback Callback function to be called when the Operation has completed (whether successful or not)
	 * @param {Object} scope Scope to execute the callback function in
	 * @method
	 */
	read: function(operation, callback, scope) {
		var me = this;
		
		// Define the success callback
		var success = function(data) {
			operation.setResultSet(Ext.create('Ext.data.ResultSet', {
				records: data,
			}));
			
			// Set the operation as successful and completed
			operation.setSuccessful();
			operation.setCompleted();
			
			if(typeof callback === 'function') {
				callback.call(scope || me, operation);
			}
		};
		
		// Define the error callback
		var error = function(data) {
			operation.setException(data);
			operation.setCompleted();
			
			if(typeof callback === 'function') {
				callback.call(scope || me, operation);
			}
		};
		
		if(typeof this.readFn === 'function') {
			// Call the implemented readFn
			this.readFn(operation, success, error);
		} else {
			var msg = 'readFn has not been defined for ' + this.self.getName();
			console.error(msg);
			
			// Call the error callback so the operation can complete
			error(msg);
		}
	},

	/**
	 * Performs an update operation.
	 * @param {Ext.data.Operation} operation The Operation to perform
	 * @param {Function} callback Callback function to be called when the Operation has completed (whether successful or not)
	 * @param {Object} scope Scope to execute the callback function in
	 * @method
	 */
	update: function(operation, callback, scope) {
		operation.setException('Update not supported.');
		operation.setCompleted();
		
		if(typeof callback === 'function') {
			callback.call(scope || me, operation);
		}
	},

	/**
	 * Performs a destroy operation.
	 * @param {Ext.data.Operation} operation The Operation to perform
	 * @param {Function} callback Callback function to be called when the Operation has completed (whether successful or not)
	 * @param {Object} scope Scope to execute the callback function in
	 * @method
	 */
	destroy: function(operation, callback, scope) {
		operation.setException('Destroy not supported.');
		operation.setCompleted();
		
		if(typeof callback === 'function') {
			callback.call(scope || me, operation);
		}
	},

	/**
	 * The readFn is invoked during a proxy read operation. This property must be overridden in the Callback proxy subclass,
	 * and must call either the readSuccess or readError functions when the operation is complete.
	 * @param {Ext.data.Operation} operation The Operation to perform.
	 * @param {Function} success Success callback.
	 * @param {Function} error Error callback.
	 * @protected
	 */
	readFn: null,
});