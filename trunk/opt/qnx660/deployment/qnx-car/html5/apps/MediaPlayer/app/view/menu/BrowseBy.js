/**
 * The browse-by menu
 * @author mlapierre
 *
 * $Id: BrowseBy.js 7262 2013-09-26 16:08:50Z nschultz@qnx.com $
 */
Ext.define('MediaPlayer.view.menu.BrowseBy', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuBrowseByView',

	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		items: [
			{
				xtype: 'menuList',
				itemTpl: '<div class="menu-label menu-image-right menu-image-{type}">{label:htmlEncode}</div>',
				store: 'BrowseBy',
			}
		]
	},
});