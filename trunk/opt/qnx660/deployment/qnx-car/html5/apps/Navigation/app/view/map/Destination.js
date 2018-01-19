/**
 * Displays the map destination
 * @author mlapierre
 *
 * $Id: Destination.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Navigation.view.map.Destination', {
	extend: 'Ext.Container',
	xtype: 'mapDestination',
	
	config: {
		layout: 'hbox',
		cls: 'map-destination',
		items: [
			{
				action: 'address',
				cls: 'address',
			},{
				action: 'eta',
				cls: 'eta',
				docked: 'right',
			}
		]
	},
});