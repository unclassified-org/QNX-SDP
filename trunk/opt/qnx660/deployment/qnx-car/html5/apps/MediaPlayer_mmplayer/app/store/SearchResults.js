/**
 * A store used to show search results.
 * @author mlapierre
 *
 * $Id: SearchResults.js 7035 2013-08-28 14:19:55Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.store.SearchResults', {
	extend: 'Ext.data.Store',

	requires: [
		'MediaPlayer.proxy.Search',
		'MediaPlayer.model.MediaNode',
	],

	config: {
		model: 'MediaPlayer.model.MediaNode',
		proxy: { type: 'car.mediaplayer.search', autoLoadMetadata: true },
		
		/**
		 * The ID of the media source.
		 */
		mediaSourceId: null,
		
		/**
		 * The ID of the media node.
		 */
		mediaNodeId: null,
		
		/**
		 * The search term.
		 */
		searchTerm: null
	},
	
	updateMediaSourceId: function(newId, oldId) {
		this.getProxy().setMediaSourceId(newId);
	},
	
	updateMediaNodeId: function(newId, oldId) {
		this.getProxy().setMediaNodeId(newId);
	},
	
	updateSearchTerm: function(newTerm, oldTerm) {
		this.getProxy().setSearchTerm(newTerm);
	}
});