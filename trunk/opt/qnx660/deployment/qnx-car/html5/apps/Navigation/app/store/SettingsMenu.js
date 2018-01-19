/**
 * A store used to show the items in the settings menu
 * @author mlapierre
 *
 * $Id: SettingsMenu.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Navigation.store.SettingsMenu', {
	extend  : 'Ext.data.Store',
	requires: ['Navigation.model.MenuItem'],

	config: {
	  model   : 'Navigation.model.MenuItem',
		data: [
			{ label: 'Route Preferences', 			type: 'route' },
			{ label: 'Language + Voice Options',	type: 'language' },
			{ label: 'Map Display',					type: 'map' },
			{ label: 'Unit of Measurement', 		type: 'units' },
		]
	},
});