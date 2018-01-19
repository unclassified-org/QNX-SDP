/**
 * A store that contains the POI base categories
 * @author mlapierre
 *
 * $Id: PoiCategories.js 6845 2013-07-16 16:36:59Z lgreenway@qnx.com $
 */
Ext.define('Navigation.store.PoiCategories', {
	extend  : 'Ext.data.Store',
	requires: [
		'Navigation.model.PoiCategory',
		'Navigation.proxy.Poi'
	],

	config: {
		model: 'Navigation.model.PoiCategory',
		proxy: {
			type: 'car.navigation.poi',
			categoryId: 0
		},
		autoLoad: true
	}
});