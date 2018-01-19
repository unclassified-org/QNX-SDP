/**
 * The settings menu
 * @author mlapierre
 *
 * $Id: Settings.js 5856 2013-02-28 19:58:52Z lgreenway@qnx.com $
 */
Ext.define('Navigation.view.menu.Settings', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuSettings',

	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		items: [
			{
				xtype: 'menuList',
		 		itemTpl: '<div class="menu-label menu-image-right menu-image-{type}">{label}</div>',
				store: 'SettingsMenu',
			}
		]
	},
});