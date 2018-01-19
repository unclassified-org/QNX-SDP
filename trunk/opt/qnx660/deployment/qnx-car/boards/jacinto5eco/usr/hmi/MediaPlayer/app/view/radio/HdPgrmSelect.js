Ext.define('MediaPlayer.view.radio.HdPgrmSelect',{
	extend: 'Ext.Panel',
	xtype: 'hdprgmselect',
	
	requires: ['Ext.Img'],
	
	config:{
		id: 'pgrmSelectPanel',
		items: [
			{
				xtype: 'image',
				id: 'hd_logo',
				src: 'resources/img/radio/HD_Logo.png',
			},
			{
				xtype: 'panel',
				id: 'pgrmBtnPanel',
				layout: 'hbox',
				items:[
					{
						cls: 'hdPgrmBtnSelected',
						html: '1'
					},
					{
						cls: 'hdPgrmBtnAvailable',
						html: '2'
					},
					{
						cls: 'hdPgrmBtnAvailable',
						html: '3'
					}
				]
			}
		]
	}
});