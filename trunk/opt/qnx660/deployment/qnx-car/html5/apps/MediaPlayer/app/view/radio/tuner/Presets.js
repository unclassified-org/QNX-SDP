/**
 * Radio tuner preset buttons. The data for the buttons is fed from the {@link MediaPlayer.store.RadioPresets RadioPresets store}.
 * @author lgreenway@lixar.com
 *
 * $Id: Presets.js 6512 2013-06-11 14:40:47Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.radio.tuner.Presets', {
	extend: 'Ext.Container',

	xtype: 'radiotunerpresets',

	requires: [
		'MediaPlayer.store.RadioPresets',
	],

	config: {
		layout: {
			type: 'hbox',
			pack: 'start',
		},
		items: [
			{
				id: 'radiopresets',
				xtype: 'dataview',
				mode: 'MULTI',
				store: 'RadioPresets',
				scrollable: false,
				cls: 'radiopresets',
		 		itemTpl: Ext.create('Ext.XTemplate', 
					'<div class="button-preset">',
						'{station}',
					'</div>',
					{
						compiled: true,
					}
				),
			},
		],
	},
});