/**
 * A store that contains the favourites
 * @author mlapierre
 *
 * $Id: Favourites.js 6845 2013-07-16 16:36:59Z lgreenway@qnx.com $
 */
Ext.define('Navigation.store.Favourites', {
	extend: 'Ext.data.Store',
	requires: [
		'Navigation.model.FavouriteLocation',
		'Navigation.proxy.Favourites'
	],

	config: {
		model: 'Navigation.model.FavouriteLocation',
		proxy: {
			type: 'car.navigation.favourites'
		},
		autoLoad: true
	}
});