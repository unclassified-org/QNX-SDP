Ext.define('MediaPlayer.view.radio.HdCentralFeature', {
	extend: 'Ext.Panel',
	xtype: 'hdradiofeature',

	config: {
		layout: {type: 'vbox', align: 'middle'},
		items:[
				{
					xtype:'panel',
					id: 'LotImage',
					html: '<img src="resources/img/radio/LOT_image.jpg" style="max-height:160px;"></img>',
					width: 160,
					height: 160,
				},
				{
					height: 15, /* blank space */
				},
				{
					defaults: {
						cls: 'hdSongInfo',
						scrollable: {
							direction: 'vertical',
							useIndicators: false
						}
					},
					items: [
						{
							id: 'albumName',
							html: 'Sports & Things'
						},
						{
							id: 'artistName',
							html: 'K-Sonix'
						},
						{
							id: 'songName',
							html: 'Sorry But I"m Not Your Girl'
						},
					]
				}
				
		]
	
	}
});