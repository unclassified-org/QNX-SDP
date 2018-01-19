/**
 * A store that contains the POI base categories
 * @author mlapierre
 *
 * $Id: PoiSubCategories.js 6845 2013-07-16 16:36:59Z lgreenway@qnx.com $
 */
Ext.define('Navigation.store.PoiSubCategories', {
	extend  : 'Ext.data.Store',
	requires: ['Navigation.model.PoiCategory'],

	config: {
		model: 'Navigation.model.PoiCategory',
		proxy: {
			type: 'car.navigation.poi'
		}
	}
});