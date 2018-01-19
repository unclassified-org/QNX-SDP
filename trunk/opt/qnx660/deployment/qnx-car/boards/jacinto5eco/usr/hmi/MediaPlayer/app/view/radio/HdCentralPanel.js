//var HDradiofeature = Ext.create('Example.view.HdCentralFeature');//.setActiveItem(0);

Ext.define('MediaPlayer.view.radio.HdCentralPanel',{
	extend: 'Ext.Panel',
	xtype: 'hdcentralpanel',
	
	requires: ['MediaPlayer.view.radio.HdCentralFeature','MediaPlayer.view.radio.HdCentralStatus'],
	
	config:{
		layout: 'card',
		items: [
			{xclass:'MediaPlayer.view.radio.HdCentralFeature'},
			{xclass:'MediaPlayer.view.radio.HdCentralStatus'}
		]
	}
});