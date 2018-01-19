/**
 * The navigation history proxy.
 * 
 * @author lgreenway
 *
 * $Id: History.js 6845 2013-07-16 16:36:59Z lgreenway@qnx.com $
 */
Ext.define('Navigation.proxy.History', {
	extend: 'Navigation.proxy.Callback',
	alias: ['proxy.car.navigation.history'],
	
	initialize: function() {
		this.callParent();
	},
	
	/**
	 * The readFn implementation for reading navigation history.
	 * @param {Ext.data.Operation} operation The Operation to perform.
	 * @param {Function} success Success callback.
	 * @param {Function} error Error callback.
	 * @protected
	 * @override
	 */
	readFn: function(operation, success, error) {
		car.navigation.getHistory(success, error);
	}
});