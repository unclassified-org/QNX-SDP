/**
 * The favourites menu
 * @author mlapierre
 *
 * $Id: Favourites.js 6086 2013-04-22 17:58:29Z mlapierre@qnx.com $
 */
Ext.define('Navigation.view.menu.Favourites', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuFavourites',

	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		layout: 'vbox',
		items: [
			{
				xtype: 'button',
				action: 'add-favourite',
				cls: 'list-topper add-favourite',
				docked: 'top',
				text: 'ADD FAVOURITE DESTINATION',
			},{
				cls: 'menu-list short',
				xtype: 'menuList',
		 		itemTpl: Ext.create('Ext.XTemplate', 
							'<div class="menu-label menu-image-right menu-image-{type}">',
								'<div class="menu-line-1">{[this.formatName(values.name)]}</div>',
								'<div class="menu-line-2">{number} {street} {city} {province} {postalCode}</div>',
							'</div>',
							{
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
				store: 'Favourites',
				emptyText: 'There are no favourite destinations',
			}
		]
	},
});