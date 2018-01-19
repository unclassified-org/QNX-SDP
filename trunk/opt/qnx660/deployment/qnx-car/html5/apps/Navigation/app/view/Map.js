/**
 * Displays the map view
 * @author mlapierre
 *
 * $Id: Map.js 5868 2013-03-05 20:23:57Z mlapierre@qnx.com $
 */
Ext.define('Navigation.view.Map', {
	extend: 'Ext.Panel',
	xtype: 'map',
	
	requires: [
		'QnxCar.view.menu.ShowButton',
		'Navigation.view.map.Directions',
	],

	config: {
		cls: 'map panel',
		layout: 'fit',
		items: [
			{
				xtype: 'menuShowButton',
			},{
				cls: 'inner-map',
				items: [
					{
						action: 'zoom-in',
						xtype: 'button',
						cls: 'zoom-in',
					},{
						action: 'zoom-out',
						xtype: 'button',
						cls: 'zoom-out',
					},{
						xtype: 'mapDirections',
						docked: 'bottom',						
					},{
						action: 'message',
						docked: 'bottom',
						cls: 'map-message',
					}
				]
			}
		]
	},

});