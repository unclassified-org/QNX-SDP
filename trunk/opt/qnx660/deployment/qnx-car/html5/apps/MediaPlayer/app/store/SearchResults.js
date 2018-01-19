/**
 * A store used to show search results
 * @author mlapierre
 *
 * $Id: SearchResults.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.store.SearchResults', {
	extend: 'Ext.data.Store',

	requires: [
		'MediaPlayer.model.SearchResult',
	],

	config: {
		model: 'MediaPlayer.model.SearchResult'
	}
});