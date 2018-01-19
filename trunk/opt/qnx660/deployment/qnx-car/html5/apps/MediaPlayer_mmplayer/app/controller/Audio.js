/**
 * The controller responsible for the audio view
 * @author mlapierre
 *
 * $Id: Audio.js 7092 2013-09-06 18:03:52Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.controller.Audio', {
	extend: 'MediaPlayer.controller.Media',

	requires: [ 'MediaPlayer.enumeration.ApplicationEvent' ],
	
	config: {
		refs: {
			index				: 'audioView',

			progressBar			: 'audioView container[action="progressbar"]',
			
			backButton			: 'audioView button[action="back"]',
			playButton			: 'audioView button[action="play"]',
			pauseButton			: 'audioView button[action="pause"]',
			skipButton			: 'audioView button[action="skip"]',

			repeatAllButton		: 'audioView button[action="repeatall"]',
			repeatOneButton		: 'audioView button[action="repeatone"]',
			shuffleButton		: 'audioView button[action="shuffle"]',
			
			nowPlaying			: 'audioView audioNowPlaying',
			mediaControls		: 'audioView mediaControls',
			playlistControls	: 'audioView playlistControls',
			
			coverflow			: 'audioView coverflow',
			
			menuShowButton		: 'audioView menuShowButton'
		},
		control: {
			repeatAllButton: {
				release: 'onRepeatAll'
			},
			repeatOneButton: {
				release: 'onRepeatOne'
			},
			shuffleButton: {
				release: 'onShuffle'
			},
			backButton: {
				release: 'onPrevTrack'
			},
			playButton: {
				release: 'onPlay'
			},
			pauseButton: {
				release: 'onPause'
			},
			skipButton: {
				release: 'onNextTrack'
			},
			progressBar: {
				seek: 'onSeek'
			},
			coverflow: {
				activeitemchange: 'onCoverflowActiveItemChange'
			}
		}
	},
	
	/**
	 * The active player name.
	 * @private
	 */
	activePlayerName: null,
	
	/**
	 * The last played media source ID. This is used to determine if the media selection menu should
	 * be slid down in the event the current track's media source is removed.
	 * @private
	 */
	lastPlayedMediaSourceId: null,
	
	/**
	 * Initializes the controller on app startup
	 */
	init: function() {
		this.getApplication().on({
			audio_index			: this.onAudioIndex,
			
			audio_pause			: this.onPause,

			radio_index			: this.onPause,
			pandora_index		: this.onPause,
			video_index			: this.onPause,
			
			scope				: this
		});

		// Attach player connected handler
		this.getApplication().on(MediaPlayer.enumeration.ApplicationEvent.PLAYER_CONNECTED,
				this.onPlayerConnected, this);
		
		// Attach update handlers to both the MediaSources and NowPlaying stores so we can update the capabilities
		// of the Audio view based on the current track's media source's capabilities.
		Ext.getStore('MediaSources').on('updaterecord', this.onMediaSourceUpdated, this);
		Ext.getStore('NowPlaying').on('updaterecord', this.onNowPlayingUpdated, this);
		
		// Also attach a media source remove handler so we can check if the media menu needs to be shown
		// if the current track's source is removed.
		Ext.getStore('MediaSources').on('removerecords', this.onMediaSourceRemoved, this);
	},
	
	/**
	 * Method called when app is ready to launch
	 */
	launch: function() {
	},

	/**
	 * Utility function used to get the current repeat mode for the active player.
	 * @return {Number} The car.mediaplayer.RepeatMode mode.
	 * @private
	 */
	getCurrentRepeatMode: function() {
		var playerState = Ext.getStore('PlayerStates').findRecord('playerName', this.activePlayerName);
		
		return playerState ? playerState.get('repeatMode') : null;
	},
	
	/**
	 * Utility function used to get the current shuffle mode for the active player.
	 * @return {Number} The car.mediaplayer.ShuffleMode mode.
	 * @private
	 */
	getCurrentShuffleMode: function() {
		var playerState = Ext.getStore('PlayerStates').findRecord('playerName', this.activePlayerName);
		
		return playerState ? playerState.get('shuffleMode') : null;
	},
	
	/**
	 * Shows the main audio view.
	 * @private
	 */
	onAudioIndex: function() {
		Ext.Viewport.setActiveItem(this.getIndex());
	},
	
	/**
	 * PLAYER_CONNECTED application event handler. Assigns the appropriate player state and now playing records
	 * to the audio view components.
	 * @param {String} name The player name.
	 * @private
	 */
	onPlayerConnected: function(name) {
		console.log('onPlayerConnected', name);

		// Cache the active player name
		this.activePlayerName = name;
		
		// Get the records based on the player name
		var playerState = Ext.getStore('PlayerStates').findRecord('playerName', this.activePlayerName),
			nowPlaying =  Ext.getStore('NowPlaying').findRecord('playerName', this.activePlayerName);

		// Set the player state on the view
		this.getMediaControls().setRecord(playerState);
		this.getPlaylistControls().setRecord(playerState);
		
		// Set the now playing info on the view
		this.getNowPlaying().setRecord(nowPlaying);
		this.getCoverflow().setRecord(nowPlaying);
		
		// Update the view capabilities immediately
		this.setViewCapabilities();
	},
	
	/**
	 * NowPlaying store update handler. if the current track changes, sets the audio view's state based on the track's
	 * media source's capabilities.
	 * @param {Ext.data.Store} The store that fired the event
	 * @param {Ext.data.Model} record The Model instance that was updated
	 * @param {Number} newIndex If the update changed the index of the record (due to sorting for example), then
	 * this gives you the new index in the store.
	 * @param {Number} oldIndex If the update changed the index of the record (due to sorting for example), then
	 * this gives you the old index in the store.
	 * @param {Array} modifiedFieldNames An array containing the field names that have been modified since the
	 * record was committed or created
	 * @private
	 */
	onNowPlayingUpdated: function(store, record, newIndex, oldIndex, modifiedFieldNames) {
		// Check if the modified NowPlaying record is for the active player name, and also if the updated
		// property is the media node, since capabilities will not have changed otherwise.
		if(this.activePlayerName === record.get('playerName') && Ext.Array.contains(modifiedFieldNames, 'mediaNode')) {
			// Cache the last played media source ID, but do not clear it if the node has changed to nothing, we may still need it
			if(record.get('mediaNode')) {
				this.lastPlayedMediaSourceId = record.get('mediaNode').get('mediaSourceId');
			}
			
			// Set the view capabilities
			this.setViewCapabilities();
		}
	},
	
	/**
	 * MediaSources store update handler. Sets the audio view's state based on the current track's media source
	 * capabilities, if the updated media source is the same as the current track's. This handler will also check
	 * if the media source for the last played track has become unavailable, and if so, automatically show the
	 * media selection menu.
	 * @param {Ext.data.Store} The store that fired the event
	 * @param {Ext.data.Model} record The Model instance that was updated
	 * @param {Number} newIndex If the update changed the index of the record (due to sorting for example), then
	 * this gives you the new index in the store.
	 * @param {Number} oldIndex If the update changed the index of the record (due to sorting for example), then
	 * this gives you the old index in the store.
	 * @param {Array} modifiedFieldNames An array containing the field names that have been modified since the
	 * record was committed or created
	 * @private
	 */
	onMediaSourceUpdated: function(store, record, newIndex, oldIndex, modifiedFieldNames) {
		// Only bother updating view capabilities if it is indeed the capabilities which have changed for the media source
		if(Ext.Array.contains(modifiedFieldNames, 'capabilities')) {
			// Check if the changed media source is that of the current track
			var nowPlaying = Ext.getStore('NowPlaying').findRecord('playerName', this.activePlayerName),
				mediaNode = nowPlaying ? nowPlaying.get('mediaNode') : null,
				mediaSource = mediaNode ? Ext.getStore('MediaSources').findRecord('id', mediaNode.get('mediaSourceId')) : null;
			
			if(mediaSource && mediaSource === record) {
				this.setViewCapabilities();
			}
		}
		
		// Check if we should show the media menu if the media source has become unavailable
		if(this.lastPlayedMediaSourceId === record.get('id')
				&& Ext.Array.contains(modifiedFieldNames, 'ready')
				&& !record.get('ready')) {
			// Prompt the user to reselect media
			this.promptMediaReselection();
		}
	},
	
	/**
	 * MediaSources store remove handler. Checks if the removed media source is that of the last played track, and if so,
	 * automatically pulls down the media menu so the user can select new media.
	 * @param {Ext.data.Store} The store that fired the event
	 * @param {Ext.data.Model[]} records The Model instances that were removed
	 * @private
	 */
	onMediaSourceRemoved: function(store, records) {
		for(var i = 0; i < records.length; i++) {
			if(this.lastPlayedMediaSourceId === records[i].get('id')) {
				// Prompt the user to reselect media
				this.promptMediaReselection();

				// No need to continue
				break;
			}
		}
	},
	
	/**
	 * Sets the state of audio view controls based on the current track's media source capabilities, or, if there is
	 * no current track, disables all.
	 * @private
	 */
	setViewCapabilities: function() {
		var nowPlaying = Ext.getStore('NowPlaying').findRecord('playerName', this.activePlayerName),
			mediaNode = nowPlaying ? nowPlaying.get('mediaNode') : null,
			mediaSource = mediaNode ? Ext.getStore('MediaSources').findRecord('id', mediaNode.get('mediaSourceId')) : null;
		
		// Enable/disable track session controls
		this.getShuffleButton().setDisabled(mediaSource ? !mediaSource.hasCapability('shuffle') : true);
		this.getRepeatAllButton().setDisabled(mediaSource ? !mediaSource.hasCapability('repeatAll') : true);
		this.getRepeatOneButton().setDisabled(mediaSource ? !mediaSource.hasCapability('repeatOne') : true);

		// Enable/disable playback controls
		this.getPlayButton().setDisabled(mediaSource ? !mediaSource.hasCapability('play') : true);
		this.getPauseButton().setDisabled(mediaSource ? !mediaSource.hasCapability('pause') : true);
		this.getBackButton().setDisabled(mediaSource ? !mediaSource.hasCapability('previous') : true);
		this.getSkipButton().setDisabled(mediaSource ? !mediaSource.hasCapability('next') : true);

		// Enable/disable progress bar seek
		this.getProgressBar().setSeekable(mediaSource ? mediaSource.hasCapability('seek') : false);
	},

	/**
	 * Shows the media selection menu if the audio view is the active view, and clears the lastPlayedMediaSourceId
	 * state.
	 * @private
	 */
	promptMediaReselection: function() {
		// Fire the media menu show event if the audio view is the active view
		if(Ext.Viewport.getActiveItem() === this.getIndex()) {
			this.getApplication().fireEvent('menu_show');
		}
		
		// Clear the last played media source ID since it's no longer needed
		this.lastPlayedMediaSourceId = null;
	},
	
	/**
	 * Progress bar seek event handler. Seeks to the position reported in the event data.
	 * @param {MediaPlayer.view.common.ProgressBar} progressBar The progress bar component which fired the event.
	 * @param {Number} position The position of the seek, in percentage.
	 */
	onSeek: function(progressBar, position) {
		this.getApplication().fireEvent(MediaPlayer.enumeration.ApplicationEvent.CMD_SEEK, position);
	},
	
	/**
	 * Repeat all playlist control release handler.
	 */
	onRepeatAll: function() {
		this.getApplication().fireEvent(MediaPlayer.enumeration.ApplicationEvent.CMD_REPEAT,
				this.getCurrentRepeatMode() === car.mediaplayer.RepeatMode.REPEAT_ALL
				? car.mediaplayer.RepeatMode.REPEAT_OFF
				: car.mediaplayer.RepeatMode.REPEAT_ALL);
	},
	
	/**
	 * Repeat one playlist control release handler.
	 */
	onRepeatOne: function() {
		this.getApplication().fireEvent(MediaPlayer.enumeration.ApplicationEvent.CMD_REPEAT,
				this.getCurrentRepeatMode() === car.mediaplayer.RepeatMode.REPEAT_ONE
				? car.mediaplayer.RepeatMode.REPEAT_OFF
				: car.mediaplayer.RepeatMode.REPEAT_ONE);
	},
	
	/**
	 * Shuffle playlist control release handler.
	 */
	onShuffle: function() {
		this.getApplication().fireEvent(MediaPlayer.enumeration.ApplicationEvent.CMD_SHUFFLE,
				this.getCurrentShuffleMode() === car.mediaplayer.ShuffleMode.SHUFFLE_ON
				? car.mediaplayer.ShuffleMode.SHUFFLE_OFF
				: car.mediaplayer.ShuffleMode.SHUFFLE_ON);
	},
	
	/**
	 * Method called on a local play event
	 */
	onPlay: function() { 
		this.getApplication().fireEvent(MediaPlayer.enumeration.ApplicationEvent.CMD_PLAY);
	},
	
	/**
	 * Method called on a local or application audio pause event
	 */
	onPause: function() { 
		this.getApplication().fireEvent(MediaPlayer.enumeration.ApplicationEvent.CMD_PAUSE);
	},
	
	/**
	 * Method called on a previous track event
	 */
	onPrevTrack: function() {
		this.getApplication().fireEvent(MediaPlayer.enumeration.ApplicationEvent.CMD_PREVIOUS);
	},
	
	/**
	 * Method called on a next track event
	 */
	onNextTrack: function() { 
		this.getApplication().fireEvent(MediaPlayer.enumeration.ApplicationEvent.CMD_NEXT);
	},
	
	/**
	 * Coverflow activeitemchange handler. Jumps to the index provided in the event data.
	 * @param {Number} index The index of the new selected active item.
	 */
	onCoverflowActiveItemChange: function(index) {
		this.getApplication().fireEvent(MediaPlayer.enumeration.ApplicationEvent.CMD_JUMP, index);
	}
});
