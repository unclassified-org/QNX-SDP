/**
 * A store used for the various types of analogue/digital/Internet radio sources.
 * @author mlapierre
 *
 * $Id: RadioSources.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.store.RadioSources', {
	extend: 'Ext.data.Store',

	requires: [
		'MediaPlayer.model.RadioSource',
	],

	config: {
		model: 'MediaPlayer.model.RadioSource',
		data: [
			{ name: 'AM/FM', id: 'am_fm', type: 'radio', available: true },
			{ name: 'Pandora', id: 'pandora', type: 'pandora', available: false },
		]
	}
});