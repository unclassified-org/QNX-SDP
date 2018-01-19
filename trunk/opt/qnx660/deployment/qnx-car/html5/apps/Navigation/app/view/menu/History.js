/**
 * The history menu
 * @author mlapierre
 *
 * $Id: History.js 5856 2013-02-28 19:58:52Z lgreenway@qnx.com $
 */
Ext.define('Navigation.view.menu.History', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuHistory',

	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		layout: 'vbox',
		items: [
			{
				xtype: 'button',
				action: 'clear-history',
				cls: 'list-topper clear-history',
				docked: 'top',
				text: 'CLEAR DESTINATION HISTORY',
			},{
				xtype: 'menuList',
				cls: 'menu-list history short',
		 		itemTpl: Ext.create('Ext.XTemplate', 
							'<div class="menu-label menu-image-right menu-image-{type}">',
								'<div class="menu-line-1">',
									'<div class="left">{[this.formatName(values.name)]}</div>',
									'<div class="right">{[this.formatTime(values.timestamp)]}</div>',
								'</div>',
								'<div class="menu-line-2">{number} {street} {city} {province} {postalCode}</div>',
							'</div>',
							{
								compiled: true,
								
								/**
								 * Format the time for display
								 * @param timestamp {Number} A unix timestamp as returned for the record
								 * @returns {String} A user readable timestamp for display
								 */
								formatTime: function(timestamp) {
									var itemDate = new Date(timestamp * 1000);
									var today = new Date();
									var yesterday = new Date();
									yesterday.setDate(today.getDate() - 1);

									if (itemDate.toLocaleDateString() == today.toLocaleDateString()) {
										return itemDate.toLocaleTimeString().replace(/:[0-9]+ /, ' ').replace(/ [A-Z]{3}/, '');
									} else if (itemDate.toLocaleDateString() == yesterday.toLocaleDateString()) {
										return 'Yesterday';
									} else {
										return itemDate.toLocaleDateString();
									}
								},
								
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