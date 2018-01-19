/**
 * The albums menu
 * @author mlapierre
 *
 * $Id: Albums.js 7262 2013-09-26 16:08:50Z nschultz@qnx.com $
 */
Ext.define('MediaPlayer.view.menu.Albums', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuAlbumsView',

	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		items: [
			{
				xtype: 'menuList',
				emptyText:'Sorry no albums found.',
		 		itemTpl: Ext.create('Ext.XTemplate', 
					'<div class="menu-label menu-image-right menu-image-album" style="{[this.getImage(values.artwork)]}">{album:htmlEncode}</div>',
					{
						compiled: true,
						
						/**
						 * Returns the background image of the current item
						 * @param artwork {String} The artwork url 
						 * @return {String} the background image or an emtpy string if not found
						 */
						getImage: function (artwork) {
							return artwork ?  'background-image: url(' + artwork +')'  : '';	
						},
					}
				),
				store: 'Albums',
			}
		]
	},
});