/**
 * The radio preset store that will be populated with band
 * presets from the API layer.
 * @author lgreenway
 *
 * $Id: RadioTuners.js 5983 2013-04-02 15:37:49Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.store.RadioTuners', {
	extend: 'Ext.data.Store',

	requires: [
		'MediaPlayer.model.RadioTuner',
	],

	config: {
		model: 'MediaPlayer.model.RadioTuner',
		data: [
			{ type: 'am',	rangeMin: '880',	rangeMax: '1710',	rangeStep: '10' },
			{ type: 'fm',	rangeMin: '87.5',	rangeMax: '107.1',	rangeStep: '0.2' },
		]
	},
});