/**
 * A store that contains the ways to browse a media source
 * @author mlapierre
 *
 * $Id: BrowseBy.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.store.BrowseBy', {
	extend: 'Ext.data.Store',

	requires: [
		'MediaPlayer.model.MenuItem',
	],

	config: {
		model: 'MediaPlayer.model.MenuItem',
		data: [
			{ label: 'Playlists',	type: 'playlist'},
			{ label: 'Artists', 	type: 'artist'},
			{ label: 'Albums', 		type: 'album'},
			{ label: 'Songs', 		type: 'song'},
			{ label: 'Genres', 		type: 'genre'},
			{ label: 'Videos', 		type: 'video'},
		]
	},
});