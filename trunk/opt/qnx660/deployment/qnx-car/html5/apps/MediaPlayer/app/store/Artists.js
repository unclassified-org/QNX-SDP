/**
 * A store used to show artists in the menus
 * @author mlapierre
 *
 * $Id: Artists.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.store.Artists', {
	extend: 'Ext.data.Store',

	requires: [
		'MediaPlayer.model.Artist',
	],
	
	config: {
		model: 'MediaPlayer.model.Artist'
	}
});