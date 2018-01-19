/**
 * Radio tuner toggle buttons (e.g. AM, FM). The data for the buttons is fed from the {@link MediaPlayer.store.RadioTuners RadioTuners store}.
 * @author lgreenway@lixar.com
 *
 * $Id: Toggle.js 5983 2013-04-02 15:37:49Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.radio.tuner.Toggle', {
	extend: 'Ext.Container',

	xtype: 'radiotunertoggle',

	requires: [
		'MediaPlayer.store.RadioTuners',
	],

	config: {
		layout: {
			type: 'hbox',
		},
		
		items: [
			{
				id: 'radiotuners',
				store: 'RadioTuners',
				xtype: 'dataview',
				scrollable: false,
				cls: 'radiotuners',
		 		itemTpl: Ext.create('Ext.XTemplate', 
					'<div class="button-tuner">',
						'{type}',
					'</div>',
					{
						compiled: true,
					}
				),
			},
		],
	},
});