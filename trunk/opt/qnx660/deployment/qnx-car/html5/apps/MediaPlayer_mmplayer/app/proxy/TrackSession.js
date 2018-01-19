/**
 * The TrackSession proxy is used for loading MediaNodes via the getTrackSessionItems method.
 * 
 * @author lgreenway
 *
 * $Id: TrackSession.js 7035 2013-08-28 14:19:55Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.proxy.TrackSession', {
	extend: 'MediaPlayer.proxy.MediaNode',
	alias: ['proxy.car.mediaplayer.tracksession'],

	config: {
		trackSessionId: null
	},

	
	/**
	 * Overridden function to invoke the getTrackSessionItems function on the parent proxy's media player instance.
	 * @param {Ext.data.Operation} operation The Operation to perform.
	 * @param {Function} readSuccess Success callback.
	 * @param {Function} readError Error callback.
	 */
	readOperation: function(operation, readSuccess, readError) {
		this.mediaPlayer.getTrackSessionItems(readSuccess,
				readError,
				operation.getLimit(),
				operation.getStart());
	}
});