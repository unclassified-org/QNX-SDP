/**
 * A store used to show the items in the main menu
 * @author mlapierre
 *
 * $Id: MediaSources.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.store.MediaSources', {
	extend: 'Ext.data.Store',

	requires: [
		'MediaPlayer.model.MediaSource',
	],

	config: {
		model: 'MediaPlayer.model.MediaSource',
		data: [
			{ name: 'Radio', id: 'radio', type: 'radio', synched: true, db: '', mount: '' },
		]
	}
});