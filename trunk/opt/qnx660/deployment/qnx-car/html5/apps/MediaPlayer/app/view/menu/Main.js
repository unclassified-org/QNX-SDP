/**
 * The browse-by menu
 * @author mlapierre
 *
 * $Id: Main.js 7262 2013-09-26 16:08:50Z nschultz@qnx.com $
 */
Ext.define('MediaPlayer.view.menu.Main', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuMain',

	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		items: [
			{
                xtype: 'menuList',
                itemTpl: '<div class="menu-label menu-image-left menu-image-{type} menu-source-synched-{synched}">{name:htmlEncode}</div>',
                store: 'MediaSources'
			}
		]
	},
});