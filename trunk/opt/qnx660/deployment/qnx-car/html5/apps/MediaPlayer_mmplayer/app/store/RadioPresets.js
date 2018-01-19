/**
 * The radio preset store that will be populated with band
 * presets from the API layer.
 * @author lgreenway
 *
 * $Id: RadioPresets.js 5983 2013-04-02 15:37:49Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.store.RadioPresets', {
	extend: 'Ext.data.Store',

	requires: [
		'MediaPlayer.model.RadioPreset',
	],

	config: {
		model: 'MediaPlayer.model.RadioPreset',
		data: []
	},
});