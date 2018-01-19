/**
 * The container for different radio views
 * @author mlapierre
 *
 * $Id: Radio.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.view.high.Radio', {
	extend: 'MediaPlayer.view.Radio',
	
	requires: [
		'MediaPlayer.view.high.radio.Tuner',
		'MediaPlayer.view.radio.Pandora',
	],
	
	config: {
		layout: 'card',
		items: [
			{ xtype: 'highRadioTunerView' },
			{ xtype: 'pandoraView' }
		]
	},
});