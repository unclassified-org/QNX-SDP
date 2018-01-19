/**
 * A message list in the menu
 * @author mlapierre
 *
 * $Id: CallLogs.js 5856 2013-02-28 19:58:52Z lgreenway@qnx.com $
 */
Ext.define('Communication.view.menu.CallLogs', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuCallLogsView',

	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		items: [
			{
				xtype: 'menuList',
		 		itemTpl: Ext.create('Ext.XTemplate', 
							'<div class="menu-label menu-image-right menu-image-{type}">',
								'<div class="menu-line-1">{sender}</div>',
								'<div class="menu-line-1 right">{[values.timestamp ? Ext.Date.format(values.timestamp, "m/d/Y g:ia") : ""]}</div>',
								'<div class="menu-line-2">{message}</div>',
							'</div>',
							{
								compiled: true,
							}
						),
			}
		]
	},

});