/**
 * The Browse proxy is used for browsing media sources.
 * 
 * @author lgreenway
 *
 * $Id: Browse.js 6672 2013-06-25 16:32:47Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.proxy.Browse', {
	extend: 'MediaPlayer.proxy.MediaNode',
	alias: ['proxy.car.mediaplayer.browse'],

	config: {
		mediaNodeId: null
	},

	
	/**
	 * Overridden function to invoke the browse function on the parent proxy's media player instance.
	 * @param {Ext.data.Operation} operation The Operation to perform.
	 * @param {Function} readSuccess Success callback.
	 * @param {Function} readError Error callback.
	 */
	readOperation: function(operation, readSuccess, readError) {
		this.mediaPlayer.browse(this.getMediaSourceId(),
				readSuccess,
				readError,
				this.getMediaNodeId(),
				operation.getLimit(),
				operation.getStart());

	}
	
});