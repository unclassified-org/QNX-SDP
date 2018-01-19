/**
 * The radio sources menu.
 * @author lgreenway@lixar.com
 *
 * $Id: RadioSources.js 7262 2013-09-26 16:08:50Z nschultz@qnx.com $
 */
Ext.define('MediaPlayer.view.menu.RadioSources', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuRadioSourcesView',

	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		items: [
			{
				xtype: 'menuList',
				itemTpl: '<div class="menu-label menu-image-right menu-image-{type} menu-source-available-{available}">{name:htmlEncode}</div>',
				store: 'RadioSources',
			}
		]
	},
});