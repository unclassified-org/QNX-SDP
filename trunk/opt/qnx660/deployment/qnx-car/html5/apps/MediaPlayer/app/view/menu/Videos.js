/**
 * The videos menu
 * @author mlapierre
 *
 * $Id: Videos.js 7262 2013-09-26 16:08:50Z nschultz@qnx.com $
 */
Ext.define('MediaPlayer.view.menu.Videos', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuVideosView',

	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		items: [
			{
				xtype: 'menuList',
				emptyText:'Sorry no videos found.',
				itemTpl: Ext.create('Ext.XTemplate', 
							'<div class="menu-label menu-image-right menu-image-video">{[this.getTitle(values.title)]:htmlEncode}</div>',
							{
								compiled: true,
								
								/**
								 * Returns the formatted title
								 * @param title {String} The title 
								 * @return {String} the title or "Untitled" 
								 */
								getTitle: function (title) {
									return (title == null || title.length <= 0) ? 'Untitled' : title;
								},
							}
						),
				store: 'Videos',
			}
		]
	},
});