Ext.define('MediaPlayer.view.radio.HdLotImage',{
	extend: 'Ext.Panel',
	xtype: 'hdlotimage',
	
	config:{
		items:[
			{
				id: 'LotImage',
				html: '<img src="resources/img/radio/LOT_image.jpg" style="max-height:160px;"></img>'
			}
		]
	}
});