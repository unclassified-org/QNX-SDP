/**
 * Displays the map directions
 * @author mlapierre
 *
 * $Id: Directions.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Navigation.view.map.Directions', {
	extend: 'Ext.Container',
	xtype: 'mapDirections',
	
	requires: [
		'Navigation.view.map.Maneuver',
		'Navigation.view.map.Destination',
		'Navigation.view.map.AddFavourite',
	],

	config: {
		cls: 'map-directions',
		layout: 'hbox',
		items: [
			{
				xtype: 'mapManeuver',
				cls: 'map-maneuver-large',
			},{
				layout: 'vbox',
				items: [
					{
						layout: 'hbox',
						items: [
							{
								xtype: 'mapDestination'
							},{
								xtype: 'button',
								action: 'cancel-navigation',
								cls: 'map-cancelnavigation',
								text: 'CANCEL NAVIGATION',
							}
						]
					},{
						layout: 'hbox',
						items: [
							{
								xtype: 'mapManeuver',
								cls: 'map-maneuver-small',
							},{
								xtype: 'mapManeuver',
								cls: 'map-maneuver-small',
							}
						]
					}
				]
			}
		]
	},
});