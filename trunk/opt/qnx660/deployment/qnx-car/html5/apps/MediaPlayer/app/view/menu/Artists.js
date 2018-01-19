/**
 * The artists menu
 * @author mlapierre
 *
 * $Id: Artists.js 7262 2013-09-26 16:08:50Z nschultz@qnx.com $
 */
Ext.define('MediaPlayer.view.menu.Artists', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuArtistsView',

	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		items: [
			{
				xtype: 'menuList',
				emptyText:'Sorry no artists found.',
		 		itemTpl: Ext.create('Ext.XTemplate', 
					'<div class="menu-label menu-image-right menu-image-artist" style="{[this.getImage(values.artwork)]}">{artist:htmlEncode}</div>',
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
				store: 'Artists',
			}
		]
	},
});