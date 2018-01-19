/**
 * The TrackSession store contains MediaNode model objects which belong to the current
 * track session.
 * @author lgreenway
 *
 * $Id: TrackSession.js 6439 2013-06-03 20:56:35Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.store.TrackSession', {
	extend: 'Ext.data.Store',
	requires: [
		'MediaPlayer.proxy.TrackSession',
		'MediaPlayer.model.MediaNode'
	],
	
	config: {
		model: 'MediaPlayer.model.MediaNode',
		proxy: { type: 'car.mediaplayer.tracksession' },
		
		/**
		 * The ID of the track session.
		 */
		trackSessionId: null,
	},
	
	updateTrackSessionId: function(newId, oldId) {
		this.getProxy().setTrackSessionId(newId);
	}
});