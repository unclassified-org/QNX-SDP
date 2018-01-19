/**
 * The radio preset store that will be populated with band
 * presets from the API layer.
 * @author lgreenway
 *
 * $Id: RadioPresets.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
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