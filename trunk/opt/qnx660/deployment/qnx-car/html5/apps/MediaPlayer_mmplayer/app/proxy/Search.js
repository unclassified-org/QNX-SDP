/**
 * The Search proxy is used to search media sources.
 * 
 * @author lgreenway
 *
 * $Id: Search.js 7377 2013-10-22 14:41:52Z nschultz@qnx.com $
 */
Ext.define('MediaPlayer.proxy.Search', {
	extend: 'MediaPlayer.proxy.MediaNode',
	alias: ['proxy.car.mediaplayer.search'],

	config: {
		mediaNodeId: null,
		searchTerm: null
	},

	/**
	 * Overridden function to invoke the search function on the parent proxy's media player instance.
	 * @param {Ext.data.Operation} operation The Operation to perform.
	 * @param {Function} readSuccess Success callback.
	 * @param {Function} readError Error callback.
	 */
	readOperation: function(operation, readSuccess, readError) {
		// The search API returns a single search result folder node which contains the search results.
		// Because we want to display the actual search results, we attach a success handler which
		// will browse the single search result node, and then send those as the read success data.
		var searchSuccess = function(result) {
			// Validate that we received a node in the result
			if(Ext.isArray(result) && result.length === 1) {
				var node = result[0];

				// Ensure we have the correct node data
				if(typeof node === 'object'
					&& node.hasOwnProperty('id')
					&& node.hasOwnProperty('type')
					&& node.type === car.mediaplayer.MediaNodeType.FOLDER) {
					
					// Browse the search result node
					this.mediaPlayer.browse(this.getMediaSourceId(),
							readSuccess,
							readError,
							node.id,
							operation.getLimit(),
							operation.getStart());
				} else {
					console.error('MediaPlayer.proxy.Search::readOperation - Search result node does not contain an ' +
							'ID property or is not of type FOLDER.');
					readError('An error occurred while performing the search.');
				}
			} else {
				console.error('MediaPlayer.proxy.Search::readOperation - Unexpected search result data.');
				readError('An error occurred while performing the search.');
			}
		}.bind(this);
		
		// Perform the search
		this.mediaPlayer.search(this.getMediaSourceId(),
				this.getSearchTerm(),
				searchSuccess,
				readError);
	}
	
});