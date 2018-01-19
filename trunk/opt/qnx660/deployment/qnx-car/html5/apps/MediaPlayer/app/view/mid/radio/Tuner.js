/**
 * The mid-quality Radio view.
 * @author lgreenway@lixar.com
 *
 * $Id: Tuner.js 5737 2013-01-28 16:51:35Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.mid.radio.Tuner', {
	extend: 'MediaPlayer.view.radio.Tuner',
	xtype: 'midRadioTunerView',
	
	requires: [
		'MediaPlayer.view.radio.tuner.Slider',
		'MediaPlayer.view.radio.tuner.Presets',
		'MediaPlayer.view.radio.tuner.StationInfo',
		'MediaPlayer.view.radio.tuner.CurrentStation',
		'MediaPlayer.view.radio.tuner.Toggle',
		'MediaPlayer.view.radio.tuner.RockerButton',

		'QnxCar.view.menu.ShowButton',

		'Ext.Img',
	],
	
	initialize: function() {
		this.callParent(arguments);
	},
	
	config: {
		currentStationCtrl: null,
		
		items: [
			{
				xtype: 'container',
				layout: 'vbox',
				cls: 'radio-mid',
				items: [
					{
						xtype: 'container',
						layout: {
							type: 'hbox',
							pack: 'start',
						},
						items: [
							{
								id: 'seek',
								xtype: 'rockerbutton',
								text: 'Seek',
							},
							{
								xtype: 'radiotunerpresets',
							},
						]
					},
					{
						xtype: 'container',
						layout: 'hbox',
						items: [
							{
								xtype: 'container',
								layout: {
									type: 'vbox',
								},
								items: [
									{
										id: 'scan',
										xtype: 'rockerbutton',
										toggleable: true,
										text: 'Scan',
									},
									{
										xtype: 'radiotunertoggle',
									},
								],
							},
							{
								xtype: 'radiostationinfo',
								flex: 1,
							},
						],
					},
					{
						xtype: 'radiotunerslider',
					},
				]
			}
		]
	},
});