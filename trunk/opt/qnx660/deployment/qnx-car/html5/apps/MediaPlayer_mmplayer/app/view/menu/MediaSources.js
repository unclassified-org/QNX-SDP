/**
 * The media sources menu.
 * @author mlapierre
 *
 * $Id: MediaSources.js 7035 2013-08-28 14:19:55Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.menu.MediaSources', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuMediaSources',

	requires: [
		'QnxCar.view.list.List',
		'MediaPlayer.view.util.Media'
	],

	config: {
		items: [
			{
				xtype: 'menuList',
				scrollToTopOnRefresh: false,
				itemTpl: '<div class="menu-label menu-image-left ' +
					'{[MediaPlayer.view.util.Media.getMediaSourceMenuImageClassName(values.type)]} menu-source-synched-{ready}">' +
					'{[MediaPlayer.view.util.Media.getMediaSourceMenuListName(values)]}' +
					'</div>',
				store: 'MediaSources'
			}
		]
	},
});