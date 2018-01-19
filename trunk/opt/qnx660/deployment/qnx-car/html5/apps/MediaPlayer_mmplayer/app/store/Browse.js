/**
 * The Browse store is used to store media browse results.
 * @author lgreenway
 *
 * $Id$
 */
Ext.define('MediaPlayer.store.Browse', {
	extend: 'Ext.data.Store',
	requires: [
		'MediaPlayer.proxy.Browse',
		'MediaPlayer.model.MediaNode',
	],
	
	config: {
		model: 'MediaPlayer.model.MediaNode',
		proxy: { type: 'car.mediaplayer.browse', autoLoadMetadata: true },
		
		/**
		 * The ID of the media source.
		 */
		mediaSourceId: null,
		
		/**
		 * The ID of the media node.
		 */
		mediaNodeId: null
	},
	
	updateMediaSourceId: function(newId, oldId) {
		this.getProxy().setMediaSourceId(newId);
	},
	
	updateMediaNodeId: function(newId, oldId) {
		this.getProxy().setMediaNodeId(newId);
	}
});