/**
 * The media menu.
 * @author lgreenway
 *
 * $Id: MediaNode.js 7262 2013-09-26 16:08:50Z nschultz@qnx.com $
 */
Ext.define('MediaPlayer.view.menu.MediaNode', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuMedia',

	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		items: [
			{
				xtype: 'menuList',
				plugins: [
					{
						xclass: 'Ext.plugin.ListPaging',
						loadMoreText: '',
						autoPaging: true
					},
				],
				emptyText:'No media found.',
				itemTpl: '<div class="menu-label menu-image-right {[MediaPlayer.view.util.Media.getNodeTypeMenuImageClassName(values.type, values.metadata)]}" ' +
					'style="{[MediaPlayer.view.util.Media.getNodeArtworkStyle(values.metadata)]}">{name:htmlEncode}</div>'
			}
		]
	}
});