/**
 * A store used to show albums in the menus
 * @author mlapierre
 *
 * $Id: Albums.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.store.Albums', {
	extend: 'Ext.data.Store',
	requires: [
		'MediaPlayer.model.Album',
	],
	
	config: {
		model: 'MediaPlayer.model.Album'
	}
});