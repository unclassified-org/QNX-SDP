Ext.define('MediaPlayer.view.radio.HdPresetList',{
	extend: 'Ext.Panel',
	xtype: 'hdpresetlist',
	
	requires: ['Ext.SegmentedButton'],
	
	config:{
		layout: 'vbox',
		items: [
			{
				id: 'presetList',
				xtype: 'list',
				scrollable: false,
				maxHeight: 0, //trick to have transparent list background
				height: 300,
				width: 100,
				store: 'hdRadioPreset',
				itemTpl: '<div class="presetBtn">{freq}</div>'
			},
			/*{
				xtype: 'segmentedbutton',
				allowDepress: false,
				top: 300,
				
				defaults: {ui: 'action', width: '33.3%'},
				items: [{text: 'A',pressed: true},{text: 'B'},{text:'C'}]
			}*/
		]
	}
});
	