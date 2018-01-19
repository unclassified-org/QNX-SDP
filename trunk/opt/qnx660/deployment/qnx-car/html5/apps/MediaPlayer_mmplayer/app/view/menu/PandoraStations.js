/**
 * The Pandora stations menu.
 * @author lgreenway@lixar.com
 *
 * $Id: PandoraStations.js 5983 2013-04-02 15:37:49Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.menu.PandoraStations', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuPandoraStationsView',

	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		items: [
			{
				xtype: 'menuList',
		 		itemTpl: Ext.create('Ext.XTemplate', 
					'<div class="menu-label menu-image-right menu-image-pandoraStation" style="{[this.getImage(values.artUrl)]}">{stationName}</div>',
					{
						compiled: true,
						
						/**
						 * Returns the background image of the current item
						 * @param thumbid {Number} The mmlibrary thumbnail id 
						 * @return {String} the background image or an emtpy string if not found
						 */
						getImage: function (artUrl) {
							artStyle = '';
							if (artUrl) {
								artStyle = 'background-image: url(' + artUrl + ')';
							}
							return artStyle;
						},
					}
				),
				store: 'PandoraStations',
			}
		]
	},
});