/**
 * A store that contains the POI locations
 * @author mlapierre
 *
 * $Id: PoiLocations.js 6845 2013-07-16 16:36:59Z lgreenway@qnx.com $
 */
Ext.define('Navigation.store.PoiLocations', {
	extend  : 'Ext.data.Store',
	requires: ['Navigation.model.Location'],

	config: {
		model: 'Navigation.model.Location',
		proxy: {
			type: 'car.navigation.poi'
		}
	}
});