/**
 * ApplicationEvent enumeration.
 * @author lgreenway
 *
 * $Id: ApplicationEvent.js 6495 2013-06-07 17:23:05Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.enumeration.ApplicationEvent', {
	extend: 'Ext.Base',

	statics: {
		/**
		 * Player connected application event.
		 * @param {String} name The player name.
		 */
		PLAYER_CONNECTED: 'player_connected',
		
		/**
		 * Create a new track session.
		 * @param {Number} mediaSourceId The media source ID.
		 * @param {?String} mediaNodeId The media node ID, or null for the root node.
		 * @param {Number} index The track index to set as current after track session creation.
		 */
		CMD_CREATE_TRACK_SESSION: 'create_track_session',
		
		/**
		 * Begin or resume playback of the current track.
		 */
		CMD_PLAY: 'play',
		
		/**
		 * Pause player command.
		 */
		CMD_PAUSE: 'pause',
		
		/**
		 * Stop player command.
		 */
		CMD_STOP: 'stop',
		
		/**
		 * Next track player command.
		 */
		CMD_NEXT: 'next',
		
		/**
		 * Previous track player command.
		 */
		CMD_PREVIOUS: 'previous',
		
		/**
		 * Jump to track player command.
		 * @param {Number} index The index of the track within the current track session.
		 */
		CMD_JUMP: 'jump',
		
		/**
		 * Seeks to a position within the current track.
		 * @param {Number} position The position, in percentage.
		 */
		CMD_SEEK: 'seek',
		
		/**
		 * Sets the player's shuffle mode.
		 * @param {Number} shuffleMode The shuffle mode.
		 */
		CMD_SHUFFLE: 'shuffle',
		
		/**
		 * Sets the player's repeat mode.
		 * @param {Number} repeatMode The repeat mode.
		 */
		CMD_REPEAT: 'repeat',
		
		/**
		 * Play a video.
		 * @param {MediaPlayer.model.MediaNode} video The video media node to play.
		 */
		CMD_PLAY_VIDEO: 'play_video',
	}
});
