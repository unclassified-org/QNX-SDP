/**
 * The high-quality Radio view.
 * @author lgreenway@lixar.com
 *
 * $Id: Tuner.js 5983 2013-04-02 15:37:49Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.high.radio.Tuner', {
	extend: 'MediaPlayer.view.radio.Tuner',
	xtype: 'highRadioTunerView',
	
	requires: [
		'MediaPlayer.store.RadioPresets',

		'MediaPlayer.view.radio.tuner.Dial',
		'MediaPlayer.view.radio.tuner.Presets',
		'MediaPlayer.view.radio.tuner.StationInfo',
		'MediaPlayer.view.radio.tuner.Toggle',
		'MediaPlayer.view.radio.tuner.RockerButton',
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
					},{
						xtype: 'panel',
						flex: 1,
						layout: 'vbox',
						cls: 'radio-rightpanel',
						items: [
							{
								xtype: 'radiotunerpresets',
							},
							{
								xtype: 'radiostationinfo',
								flex: 1,
							},
							{
								xtype: 'panel',
								layout: {
									type: 'hbox',
									pack: 'start',
								},
								cls: 'radio-controls',
								items: [
									{
										xtype: 'radiotunertoggle',
									},
									{
										xtype: 'container',
										layout: {
											type: 'hbox',
											pack: 'end',
										},
										flex: 1,
										items: [
											{
												id: 'seek',
												xtype: 'rockerbutton',
												text: 'Seek',
											},
											{
												id: 'scan',
												xtype: 'rockerbutton',
												toggleable: true,
												text: 'Scan',
											},
										],
									},
								]
							},
						]
					}
				]
			}
		]
	},
});