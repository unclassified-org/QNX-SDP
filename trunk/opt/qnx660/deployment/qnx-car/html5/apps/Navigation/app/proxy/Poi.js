/**
 * The POI proxy.
 * 
 * @author lgreenway
 *
 * $Id: Poi.js 6845 2013-07-16 16:36:59Z lgreenway@qnx.com $
 */
Ext.define('Navigation.proxy.Poi', {
	extend: 'Navigation.proxy.Callback',
	alias: ['proxy.car.navigation.poi'],

	config: {
		/**
		 * The POI category ID.
		 */
		categoryId: 0
	},
	
	initialize: function() {
		this.callParent();
	},
	
	/**
	 * The readFn implementation for reading navigation POIs.
	 * @param {Ext.data.Operation} operation The Operation to perform.
	 * @param {Function} success Success callback.
	 * @param {Function} error Error callback.
	 * @protected
	 * @override
	 */
	readFn: function(operation, success, error) {
		car.navigation.browsePOI(this.getCategoryId(), success, error);
	}
});