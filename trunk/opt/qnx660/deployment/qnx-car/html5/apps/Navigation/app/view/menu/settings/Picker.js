/**
 * The language settings menu
 * @author mlapierre
 *
 * $Id: Language.js 5737 2013-01-28 16:51:35Z lgreenway@qnx.com $
 */
Ext.define('Navigation.view.menu.settings.Picker', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuSettingsPicker',

	config: {
		items: [
			{
				xtype: 'menuList',
		 		itemTpl: '<div class="menu-label">{text}</div>',
				store: 'SettingsPicker',
			}
		]
	},
});