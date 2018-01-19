/**
 * The navigation favourites proxy.
 * 
 * @author lgreenway
 *
 * $Id: Favourites.js 6845 2013-07-16 16:36:59Z lgreenway@qnx.com $
 */
Ext.define('Navigation.proxy.Favourites', {
	extend: 'Navigation.proxy.Callback',
	alias: ['proxy.car.navigation.favourites'],
	
	initialize: function() {
		this.callParent();
	},
	
	/**
	 * The readFn implementation for reading navigation favourites.
	 * @param {Ext.data.Operation} operation The Operation to perform.
	 * @param {Function} success Success callback.
	 * @param {Function} error Error callback.
	 * @protected
	 * @override
	 */
	readFn: function(operation, success, error) {
		car.navigation.getFavourites(success, error);
	}
});