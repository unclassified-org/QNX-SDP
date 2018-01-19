/**
 * The container for different radio views
 * @author mlapierre
 *
 * $Id: Radio.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.view.mid.Radio', {
	extend: 'MediaPlayer.view.Radio',
	
	requires: [
		'MediaPlayer.view.mid.radio.Tuner',
		'MediaPlayer.view.radio.Pandora',
	],
	
	config: {
		layout: 'card',
		items: [
			{ xtype: 'midRadioTunerView' },
			{ xtype: 'pandoraView' }
		]
	},
});