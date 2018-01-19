/**
 * The messages menu
 * @author mlapierre
 *
 * $Id: Messages.js 5856 2013-02-28 19:58:52Z lgreenway@qnx.com $
 */
Ext.define('Communication.view.menu.Messages', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuMessagesView',

	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		items: [
			{
				xtype: 'menuList',
		 		itemTpl: Ext.create('Ext.XTemplate', 
							'<div class="menu-label menu-image-right menu-image-{type} menu-item-available-{available}">{label}</div>',
							{
								compiled: true,
							}
						),
				store: 'MessagesMenu',
			}
		]
	},

});