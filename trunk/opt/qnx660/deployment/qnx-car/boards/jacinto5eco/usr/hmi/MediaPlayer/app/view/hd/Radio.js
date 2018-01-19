/**
 * The hd-quality Radio view.
 * @author lgreenway@lixar.com
 *
 * $Id$
 */
Ext.define('MediaPlayer.view.hd.Radio', {
	extend: 'MediaPlayer.view.Radio',
	
	requires: [
		'MediaPlayer.store.RadioPresets',

		'MediaPlayer.view.radio.TunerDial',
		'MediaPlayer.view.radio.HdCentralPanel',
		'MediaPlayer.view.radio.HdPresetList',
		'MediaPlayer.view.radio.HdPgrmSelect',
	],
	
	config: {
		items: [
			{
				xtype: 'container',
				layout: 'hbox',
				cls: 'radio-high',
				items: [
					{
						xtype: 'radiotunerdial',
						cls: 'radio-tunerDial',
						flex: 7,
					},
					{
						xtype: 'button',
						id: 'bandSelectBtn',
						text: 'FM'
					},
					{
						xtype: 'hdprgmselect',
					},
					{
						
						id: 'stationName',
						html: 'KKHH-FM'
					},
					{
						
						id: 'genreName',
						html: 'Classic Rock',
					},
					{
						xtype: 'hdcentralpanel',
						flex: 7
					},
					{
						xtype: 'container',
						flex: 2,
						layout: 'vbox',
						items: [
							{
								xtype: 'button',
								id: 'showHdStatusBtn',
								text: 'Show Status',
								ui: 'action'
							},
							{
								height: 15
							},
							{
								xtype: 'hdpresetlist',
							}
						]
					},
					{
						id: 'hdTrafficPanel',
						html: 'Road constructn on Clark Av at Casino Center Bld '
					},
				]
			}
		]
	},
});