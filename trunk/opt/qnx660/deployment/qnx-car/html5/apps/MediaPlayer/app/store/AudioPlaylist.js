/**
 * A store used to store the current audio playlist
 * @author mlapierre
 *
 * $Id: AudioPlaylist.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.store.AudioPlaylist', {
	extend  : 'Ext.data.Store',

	requires: [
		'MediaPlayer.model.Song',
	],

	config: {
		model   : 'MediaPlayer.model.Song'
	}
});