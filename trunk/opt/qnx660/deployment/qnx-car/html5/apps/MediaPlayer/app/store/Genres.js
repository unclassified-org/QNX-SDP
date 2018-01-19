/**
 * A store used to show genres in the menus
 * @author mlapierre
 *
 * $Id: Genres.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.store.Genres', {
	extend: 'Ext.data.Store',

	requires: [
		'MediaPlayer.model.Genre',
	],

	config: {
		model: 'MediaPlayer.model.Genre'
	}
});