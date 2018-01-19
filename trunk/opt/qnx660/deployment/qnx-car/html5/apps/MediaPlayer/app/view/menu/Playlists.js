/**
 * The Playlists menu
 * @author nschultz
 *
 * $Id: Playlists.js 5856 2013-02-28 19:58:52Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.menu.Playlists', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuPlaylistsView',

	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		items: [
			{
				xtype: 'menuList',
				emptyText:'Sorry, no support for playlists',
				/*itemTpl: Ext.create('Ext.XTemplate', 
							'<div class="menu-label menu-image-right menu-image-video">{["this.getTitle()"]}</div>',
							{
								compiled: true,
								*/
								/**
								 * Returns the formatted title
								 * @param title {String} The title 
								 * @return {String} the title or "Untitled" 
								 */
								 /*
								getTitle: function (title) {
									return (title == null || title.length <= 0) ? 'Untitled' : title;
								},
								
							}
						),*/
				store: 'Playlists',
			}
		]
	},
	
	
});