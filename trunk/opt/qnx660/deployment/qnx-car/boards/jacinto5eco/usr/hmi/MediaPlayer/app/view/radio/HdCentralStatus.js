Ext.define('MediaPlayer.view.radio.HdCentralStatus', {
	extend: 'Ext.Panel',
	xtype: 'hdradiostatus',
	
	requires: ['MediaPlayer.view.radio.HdLotImage',],

	config: {
		layout: {type: 'vbox', align: 'middle'},
		scrollable: true,
		items:[
		{	
			xtype: 'panel',
			width: '90%',
			layout: {type:'hbox', align:'middle'},
			items:[
				{
					id: 'hdStatusUpdate',
					html:"Status Update"
				},
				{
					xtype:'spacer',
				},
				{
					id: 'hdAcquireBtn',
					xtype: 'button',
					text: 'Acquire',
					ui: 'action',
				},
			]
		},
		{
			height: 10
		},
		{
			xtype: 'panel',
			cls: 'hdStatusText',
			width: '80%',
			layout: {type:'hbox', align:'middle'},
			defaults: {flex: 1},
			items:[
				{
					xtype: 'panel',
					layout: 'vbox',
					items: [
						{html: "HD Signal:"},
						{html: "HD SIS:"},
						{html: "HD Audio:"},
						{html: "DAAI:"},
						{html: "QI:"},
						{html: "cd/no:"},
						{html: "curpgm"},
						{html: "pgmAvail"},
						{html: "psmode"},
					]
				},
				{
					xtype: 'panel',
					layout: 'vbox',
					items: [
						{id: 'stat_signal',  html: "False"},
						{id: 'stat_sis',     html: "False"},
						{id: 'stat_audio',   html: "False"},
						{id: 'stat_daai',    html: "0"},
						{id: 'stat_qi',      html: "0"},
						{id: 'stat_cdno',    html: "0"},
						{id: 'stat_curpgm',  html: "0"},
						{id: 'stat_pgmAvail',html: "7"},
						{id: 'stat_psmode',  html: "MPS"},
					]
				}
			]
		}
		]
	
	}
});