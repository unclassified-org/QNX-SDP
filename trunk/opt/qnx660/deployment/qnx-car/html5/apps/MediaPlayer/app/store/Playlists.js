/**
 * A store used to show Playlists in the menus
 * @author nschultz
 *
 * $Id: Playlists.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.store.Playlists', {
	extend: 'Ext.data.Store',
	requires: [
		'MediaPlayer.model.Playlist',
	],
	
	config: {
		model: 'MediaPlayer.model.Playlist'
	}
});