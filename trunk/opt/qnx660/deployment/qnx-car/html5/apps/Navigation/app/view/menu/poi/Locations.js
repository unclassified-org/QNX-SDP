/**
 * The poi locations menu
 * @author mlapierre
 *
 * $Id: Locations.js 5856 2013-02-28 19:58:52Z lgreenway@qnx.com $
 */
Ext.define('Navigation.view.menu.poi.Locations', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuPoiLocations',

	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		items: [
			{
				xtype: 'menuList',
		 		itemTpl: Ext.create('Ext.XTemplate', 
		 			'<div class="menu-label menu-image-right menu-image-{type}">',
						'<div class="menu-line-1">{name}</div>',
						'<div class="menu-line-2">{number} {street} {city} {province} {postalCode}</div>',
					'</div>',
					{
						compiled: true,
					}
				),
				store: 'PoiLocations',
				emptyText: 'There are no Points of Interest matching your selection',
			}
		]
	},
});