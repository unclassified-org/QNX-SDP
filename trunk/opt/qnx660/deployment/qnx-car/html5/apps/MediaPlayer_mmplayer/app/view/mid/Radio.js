/**
 * The container for different radio views
 * @author mlapierre
 *
 * $Id: Radio.js 5983 2013-04-02 15:37:49Z lgreenway@qnx.com $
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