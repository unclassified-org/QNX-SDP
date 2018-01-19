/**
 * The add favourite menu
 * @author mlapierre
 *
 * $Id: History.js 5645 2013-01-04 18:02:10Z mlapierre@qnx.com $
 */
Ext.define('Navigation.view.menu.favourites.AddFavourite', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuFavouritesAdd',

	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		layout: 'vbox',
		items: [
			{
				xtype: 'menuList',
		 		itemTpl: Ext.create('Ext.XTemplate', 
							'<div class="menu-label menu-image-right menu-image-{type}">',
								'<div class="menu-line-1">{[this.formatName(values.name)]}</div>',
								'<div class="menu-line-2">{number} {street} {city} {province} {postalCode}</div>',
							'</div>',
							{
								compiled: true,

								/**
								 * Formats the destination name
								 * @param name {String} The name as returned for the record
								 * @returns {String} A user-friendly name for the destination
								 */
								formatName: function(name) {
									if (typeof name !== 'string' || name.trim().length <= 0) {
										return "Unnamed Destination";
									}
									return name;
								},
							}
						),
				store: 'History',
				emptyText: 'There are no recent destinations',
			}
		]
	},
});