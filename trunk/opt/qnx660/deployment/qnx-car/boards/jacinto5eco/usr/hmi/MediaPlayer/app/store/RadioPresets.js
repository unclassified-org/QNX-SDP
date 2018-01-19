/**
 * The radio preset store that will be populated with band
 * presets from the API layer.
 * @author lgreenway
 *
 * $Id: RadioPresets.js 2475 2012-05-14 20:43:55Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.store.RadioPresets', {
	extend: 'Ext.data.Store',

	requires: [
		'MediaPlayer.model.RadioPreset',
	],

	config: {
		model: 'MediaPlayer.model.RadioPreset',
		autoLoad: true,
		data: [],
		storeId: 'hdRadioPreset',
	},
});