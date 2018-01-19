/**
 * A store used to store the current video playlist
 * @author mlapierre
 *
 * $Id: VideoPlaylist.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.store.VideoPlaylist', {
	extend: 'Ext.data.Store',

	requires: [
		'MediaPlayer.model.Video',
	],

	config: {
		model: 'MediaPlayer.model.Video'
	}
});