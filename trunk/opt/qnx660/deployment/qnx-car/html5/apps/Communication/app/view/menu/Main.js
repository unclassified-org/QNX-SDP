/**
 * The browse-by menu
 * @author mlapierre
 *
 * $Id: Main.js 5856 2013-02-28 19:58:52Z lgreenway@qnx.com $
 */
Ext.define('Communication.view.menu.Main', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuMain',

	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		items: [
			{
				xtype: 'menuList',
				itemTpl: '<div class="menu-label menu-image-left menu-image-{type} menu-item-available-{available}">{label}</div>',
				store: 'MainMenu',
			}
		]
	},
});