/**
 * The radio sources menu.
 * @author lgreenway@lixar.com
 *
 * $Id: RadioSources.js 5983 2013-04-02 15:37:49Z lgreenway@qnx.com $
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
				itemTpl: '<div class="menu-label menu-image-right menu-image-{type} menu-source-available-{available}">{name}</div>',
				store: 'RadioSources',
			}
		]
	},
});