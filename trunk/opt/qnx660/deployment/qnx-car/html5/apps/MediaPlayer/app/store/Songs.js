/**
 * A store used to show songs in the menus
 * @author mlapierre
 *
 * $Id: Songs.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.store.Songs', {
	extend  : 'Ext.data.Store',

	requires: [
		'MediaPlayer.model.Song',
	],

	config: {
		model   : 'MediaPlayer.model.Song'
	}
});