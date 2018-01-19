/**
 * The container for different radio views
 * @author mlapierre
 *
 * $Id: Radio.js 5983 2013-04-02 15:37:49Z lgreenway@qnx.com $
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