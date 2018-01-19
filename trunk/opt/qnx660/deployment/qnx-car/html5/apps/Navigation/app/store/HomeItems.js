/**
 * A genre store used to show genres in the menus
 * @author mlapierre
 *
 * $Id: HomeItems.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Navigation.store.HomeItems', {
	extend: 'Ext.data.Store',

	requires: [
		'Navigation.model.HomeItem',
	],

	config: {
		model: 'Navigation.model.HomeItem',
		data: [
			{ label: 'SEARCH DESTINATION',	cls: 'unsafe search ',		safe: true,		event: 'search_index'},
			{ label: 'POINTS OF INTEREST', 	cls: 'unsafe poi ',			safe: true, 	event: 'poi_index'},
			{ label: 'FAVOURITE PLACES', 	cls: 'safe favourites ',	safe: true, 	event: 'favourites_index'},
			{ label: 'TRAVEL HISTORY', 		cls: 'safe history ',		safe: false,	event: 'history_index'},
			{ label: 'BROWSE MAP', 			cls: 'safe map ',			safe: false,	event: 'map_index'},
			{ label: 'NAVIGATION SETTINGS', cls: 'unsafe settings ',	safe: false,	event: 'settings_index'},
		]
	},
});