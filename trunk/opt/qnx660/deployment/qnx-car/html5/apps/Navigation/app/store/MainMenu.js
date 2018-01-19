/**
 * A store used to show the items in the main menu
 * @author mlapierre
 *
 * $Id: MainMenu.js 5767 2013-02-01 01:21:07Z mlapierre@qnx.com $
 */
Ext.define('Navigation.store.MainMenu', {
	extend  : 'Ext.data.Store',
	requires: ['Navigation.model.MenuItem'],

	config: {
	  model   : 'Navigation.model.MenuItem',
		data: [
			{ label: 'Search Destination', 	type: 'search' },
			{ label: 'Points of Interest', 	type: 'poi' },
			{ label: 'Favourite Places', 	type: 'favourites' },
			{ label: 'Travel History', 		type: 'history' },
			{ label: 'Map', 				type: 'map' },
			{ label: 'Navigation Settings',	type: 'settings' },
		]
	},
});