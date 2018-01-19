/**
 * The controller responsible for the audio view
 * @author mlapierre
 *
 * $Id: Audio.js 7262 2013-09-26 16:08:50Z nschultz@qnx.com $
 */
Ext.define('MediaPlayer.controller.Audio', {
	extend: 'MediaPlayer.controller.Media',

	config: {
		refs: {
			index				: 'audioView',

			repeatAll			: 'audioView button[action=repeatall]',
			repeatOne			: 'audioView button[action=repeatone]',
			shuffle				: 'audioView button[action=shuffle]',
			
			source				: 'audioView container[action="source"]',
			songTitle			: 'audioView container[action="songtitle"]',
			artist				: 'audioView container[action="artist"]',
			album				: 'audioView container[action="album"]',
			progressBar			: 'audioView container[action="progressbar"]',
			progressTime		: 'audioView container[action="progresstime"]',
			
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
			coverflow			: 'audioView container[action=coverflow]',
			menuShowButton		: 'audioView menuShowButton',
		},
		control: {
			repeatAllButton: {
				release: function(button, e) {
					if (!button.isDisabled()) {
						this.getRepeatOne().removeCls('x-button-pressed');
						if (button.getCls().indexOf('x-button-pressed') < 0) {
							//not pressed, make it pressed
							button.addCls('x-button-pressed');
							qnx.audioplayer.setRepeat(qnx.audioplayer.REPEAT_ALL);
						} else {
							//depressing
							button.removeCls('x-button-pressed');
							qnx.audioplayer.setRepeat(qnx.audioplayer.REPEAT_NONE);
						}
					}
				}
			},
			repeatOneButton: {
				release: function(button, e) {
					if (!button.isDisabled()) {
						this.getRepeatAll().removeCls('x-button-pressed');
						if (button.getCls().indexOf('x-button-pressed') < 0) {
							//not pressed, make it pressed
							button.addCls('x-button-pressed');
							qnx.audioplayer.setRepeat(qnx.audioplayer.REPEAT_ONE);
						} else {
							//depressing
							button.removeCls('x-button-pressed');
							qnx.audioplayer.setRepeat(qnx.audioplayer.REPEAT_NONE);
						}
					}
				}
			},
			shuffleButton: {
				release: function(button, e) {
					if (!button.isDisabled()) {
						if (button.getCls().indexOf('x-button-pressed') < 0) {
							//not pressed, make it pressed
							button.addCls('x-button-pressed');
							qnx.audioplayer.setShuffle(qnx.audioplayer.SHUFFLE_ON);
						} else {
							//depressing
							button.removeCls('x-button-pressed');
							qnx.audioplayer.setShuffle(qnx.audioplayer.SHUFFLE_OFF);
						}
					}
				}
			},
			coverflow: {
				activeitemchange: "onCoverflowActiveItemChange"
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
			}
		},

		playlistIndex: 0,
		currentDuration: 0,
		currentDurationFormatted: '0:00',
		initialLoad: true,
		mediaSource: null,
		isLoadingDefault: false,
	},
	
	/**
	 * Initializes the controller on app startup
	 */
	init: function() {
		this.getApplication().on({
			audio_index			: this.onAudioIndex,
			audio_play			: this.onAudioPlay,
			audio_pause			: this.onAudioPause,

			radio_index			: this.onAudioPause,
			pandora_index		: this.onAudioPause,
			video_index			: this.onAudioPause,
			video_play			: this.onAudioPause,

			mediasource_added	: this.onMediaSourceAdded,
			mediasource_removed	: this.onMediaSourceRemoved,
			scope				: this
		});
		
		this.playlistStore = Ext.getStore('AudioPlaylist');
		this.playlistStore.on('clear', this.onPlaylistCleared, this);
		this.playlistStore.on('addrecords', this.onPlaylistFilled, this);

		blackberry.event.addEventListener("audioplayerupdate",this.onAudioEvent.bind(this));
		blackberry.event.addEventListener("audioplayertrack",this.onTrackChangeEvent.bind(this));
		blackberry.event.addEventListener("audioplayerstate",this.onTrackSessionStateEvent.bind(this));

	},
	
	/**
	 * Method called when app is ready to launch
	 */
	launch: function() {
		//add swipe listener
		this.getMenuShowButton().element.on({
			touchstart: function() { this.getApplication().fireEvent('menu_show'); },
			scope: this
		});
		
		//load the default track session
		this.loadDefaultTrackSession();	
	},

	/**
	 * Shows the main audio view
	 */
	onAudioIndex: function() {
		Ext.Viewport.setActiveItem(this.getIndex());
	},
	
	/**
	 * Loads the default track session for the media player
	 */
	loadDefaultTrackSession: function() {	
		//make sure we only call this when needed
		if (this.getMediaSource() != null || this.getIsLoadingDefault()) {
			return;
		}
		
		try {
			this.setIsLoadingDefault(true);
		
			//set paused state
			this.onPause();
		
			//clear the current playlist
			this.playlistStore.removeAll();
			this.setInitialLoad(true);

			//set default library
			var sources = qnx.mediasource.get();

			//default to local storage, if it exists
			if (sources && sources.dbmme) {
				var songs = qnx.medialibrary.getAllSongs(sources.dbmme);
				if (songs && songs.length > 0) {
					this.loadMediaSource(sources.dbmme, songs);
					return;
				}
			}
		
			//local storage doesn't exist. default to first available source
			var keys = Object.keys(sources);
			if (keys && keys.length > 0) {
				for (var i=0; i<keys.length; i++) {
					var mediaSource = sources[keys[i]];
					var songs = qnx.medialibrary.getAllSongs(mediaSource);
					if (songs && songs.length > 0) {
						this.loadMediaSource(mediaSource, songs);
						return;
					}
				}
			}	
		} finally {
			this.setIsLoadingDefault(false);
		}
	},
	
	/**
	 * Loads a verified and valid media source
	 * @param mediaSource {Object} The media source to load
	 * @param songs {Array} The songs for the given media source
	 */
	loadMediaSource: function(mediaSource, songs) {
		//songs found, save the current media source
		this.setMediaSource(mediaSource);
		this.redrawSource(this.getMediaSource());
		this.setCurrentSong(songs[0]);

		//prepare the playlist
		qnx.audioplayer.setTrackSession({
			source: this.getMediaSource(),
			type: qnx.audioplayer.TYPE_ALL,
		});
	},
	
	/**
	 * Updates the HMI with metadata for a specific song
	 * @param song {Object} The new song
	 */
	setCurrentSong: function(song) {
		if (song) {
			var songObj = (typeof song.getData == 'function') ? song.getData() : song;

			this.setCurrentDuration(songObj.duration);
			this.setCurrentDurationFormatted(this.formatDuration(this.getCurrentDuration() / 1000));
		
			this.getSongTitle().setHtml(Ext.util.Format.htmlEncode(songObj.title));
			this.getArtist().setHtml(Ext.util.Format.htmlEncode(songObj.artist));
			this.getAlbum().setHtml(Ext.util.Format.htmlEncode(songObj.album));
			this.getProgressBar().setProgress(0);
			this.getProgressTime().setHtml('0:00 / ' + this.getCurrentDurationFormatted());	
		}
	},
	
	/**
	 * Updates the HMI based on if the tracksession is empty or not
	 * @param song {Object} The new song
	 */
	setTracksessionEmpty: function(isEmpty) {
		this.getNowPlaying().setTracksessionEmpty(isEmpty);
		
		this.getShuffleButton().setDisabled(isEmpty);
		this.getRepeatAllButton().setDisabled(isEmpty);
		this.getRepeatOneButton().setDisabled(isEmpty);

		this.getPlayButton().setDisabled(isEmpty);
		this.getPauseButton().setDisabled(isEmpty);
		this.getBackButton().setDisabled(isEmpty);
		this.getSkipButton().setDisabled(isEmpty);
	},

	/**
	 * Event handler triggered from the coverflow component whenever a 
	 * user swipes through the album covers and stops at a specific cover
	 * @param index {Number} The index value of the song to play
	 */
	onCoverflowActiveItemChange: function(index) {
		this.playSongAt(index);
	},

	/**
	 * Progress bar seek event handler. Seeks to the position reported in the event data.
	 * @param {MediaPlayer.view.common.ProgressBar} progressBar The progress bar component which fired the event.
	 * @param {Number} position The position of the seek, in percentage.
	 */
	onSeek: function(progressBar, position) {
		qnx.audioplayer.seek(Math.round(this.getCurrentDuration() * (position / 100)));
		this.onPlay();
	},
	
	/**
	 * Play a song from the current playlist
	 * @param index {Number} The index of the song to play in the current playlist
	 */
	playSongAt: function(index) {
		qnx.audioplayer.playAt(index);
		//update the playlist index
		this.setPlaylistIndex(index);
		//update the ui
		this.setCurrentSong(this.playlistStore.getAt(index));
		//make sure the ui is in a playing state
		if (this.getPauseButton().getHidden()) {
			this.getPauseButton().setHidden(false);
			this.getPlayButton().setHidden(true);
		}
	},
	
	/**
	 * Method called when redrawing the source on the audio view
	 * @param source {Object} The source object
	 */
	redrawSource: function(source) {
		this.getSource().setCls("x-container nowplaying-source media-source-" + source.type);
		this.getSource().setHtml(Ext.util.Format.htmlEncode(source.name));
	},
	
	/**
	 * Method called on a local play event
	 */
	onPlay: function() { 
		if (this.playlistStore.getCount() > 0) {
			this.getPauseButton().setHidden(false);
			this.getPlayButton().setHidden(true);
			qnx.audioplayer.play();
		}
	},
	
	/**
	 * Method called on a local pause event
	 */
	onPause: function() { 
		this.getPauseButton().setHidden(true);
		this.getPlayButton().setHidden(false);
		qnx.audioplayer.pause();
	},
	
	/**
	 * Method called on a previous track event
	 */
	onPrevTrack: function() { 
		if (this.playlistStore.getCount() > 0) {
			var index = (this.getPlaylistIndex() == 0) ? this.playlistStore.getCount() - 1 : this.getPlaylistIndex() - 1;
			this.playSongAt(index);
		}
	},
	
	/**
	 * Method called on a next track event
	 */
	onNextTrack: function() { 
		if (this.playlistStore.getCount() > 0) {
			var index = (this.getPlaylistIndex() + 1 >= this.playlistStore.getCount()) ? 0 : this.getPlaylistIndex() + 1;
			this.playSongAt(index);
		}
	},
	
	/**
	 * Method called when a global "audio_pause" event is fired
	 * @param event {Object} The event details
	 */
	onAudioPause: function(event) {
		this.onPause();
	},

	/**
	 * Method called when pps event is fired on the media player's audio context
	 * @param event {Object} The event details
	 */
	onAudioEvent: function(event) {
		if(event){
			if(event.dbready && event.index >= 0){
				//the database track order has changed. possibly because of shuffle or 
				//a new playlist being loaded. we need to update the playlist store to
				//reflect the new tracks/order
				var songs = qnx.medialibrary.getTrackSession(this.getMediaSource());
				this.playlistStore.removeAll();
				this.playlistStore.add(songs);
				this.setPlaylistIndex(event.index);
				
				//find out if this is a new tracksession or not
				if (event.trksession) {
					//yes, new tracksession
					//check if this is the initial startup
					if (this.getInitialLoad()) {
						//app just started up, don't auto-play
						this.setInitialLoad(false);
						this.getCoverflow().setActiveItem(this.getPlaylistIndex());
					} else {
						//play song at specified index
						this.playSongAt(this.getPlaylistIndex());
					}
				} else {
					//same track session, so this means shuffle was changed
					//keep playing the same song but just update the ui
					this.getCoverflow().setActiveItem(this.getPlaylistIndex());
				}
			}
			
			if (event.duration) {
				//required because some ipods have blank duration in the model
				this.setCurrentDuration(event.duration);
				this.setCurrentDurationFormatted(this.formatDuration(event.duration / 1000));
			}
			
			// Update the progress bar position and time
			if (event.position && this.getPlayButton().isHidden()) {
				this.getProgressBar().setProgress((event.position / this.getCurrentDuration()) * 100);
				this.getProgressTime().setHtml(this.formatDuration(event.position / 1000) + ' / ' + this.getCurrentDurationFormatted());
			}
		}
		
	},
	
	/**
	 * Method called when the current track is changed remotely 
	 * @param event {Object} The event details
	 */
	onTrackChangeEvent: function(event) {
		if (event && !isNaN(event.index)) {
			this.setPlaylistIndex(event.index);
			this.getCoverflow().setActiveItem(this.getPlaylistIndex());
			
			var song = this.playlistStore.getAt(this.getPlaylistIndex());
			this.setCurrentSong(song);
		}
	},
	
	/**
	 * Method called when the current playing track ends 
	 * @param event {Object} The event details
	 */
	onTrackSessionStateEvent: function(event) {
		if (event && event.state) {
			switch (event.state) {
				case "PAUSED":
				case "STOPPED":
				case "IDLE":
					this.getPauseButton().setHidden(true);
					this.getPlayButton().setHidden(false);
					break;
				
				case "PLAYING":
					this.getPauseButton().setHidden(false);
					this.getPlayButton().setHidden(true);
					break;
			}
		}
	},

	/**
	 * Method called when a remote play event is received
	 * @param event {Object} The event details
	 */
	onAudioPlay: function(event) {
		this.onAudioIndex();
		if (event.data == undefined) {
			this.onPlay();
		} else {
			if (event.data.source) {
				this.setMediaSource(event.data.source);
				this.redrawSource(this.getMediaSource());
			}
			
			var tsType = null;
			var idx = event.data.index;
			switch (event.data.type) {
				case 'fid': 
					tsType = qnx.audioplayer.TYPE_ALL;
					if (isNaN(idx) || idx < 0) {
						//from search or voice or other remote... lookup the index
						var songs = qnx.medialibrary.getAllSongs(this.getMediaSource());
						for (var i=0; i<songs.length; i++) {
							if (songs[i].fid == event.data.id) {
								idx = i;
								break;
							}
						}
					}
					break;
					
				case 'album':
					tsType = qnx.audioplayer.TYPE_ALBUM;
					break;
				
				case 'artist':
					tsType = qnx.audioplayer.TYPE_ARTIST;
					break;

				case 'genre':
					tsType = qnx.audioplayer.TYPE_GENRE;
					break;
					
				default: 
					console.log('unknown tracksession type: ' + event.data.type);
					return;
			}
			
			qnx.audioplayer.setTrackSession({
				source: this.getMediaSource(),
				type: tsType,
				id: event.data.id,
			}, idx);
			
			//HACK: remove shuffle when changing track session
			//FIXME waiting on tracksession api fix to provide fid instead of idx
			this.getShuffleButton().removeCls('x-button-pressed');
		}
	},	
	
	/**
	 * Method called when the playlist store is cleared
	 * @param store {Object} A reference to the playlist store
	 * @param opts {Object} The options object passed to the listener
	 */
	onPlaylistCleared: function(store, opts) {
		this.setTracksessionEmpty(true);
	},
	
	/**
	 * Method called when records are added to the playlist store
	 * @param store {Object} A reference to the playlist store
	 * @param records {Object} An array of the added records
	 * @param opts {Object} The options object passed to the listener
	 */
	onPlaylistFilled: function(store, records, opts) {
		if (records && records.length > 0) {
			this.setTracksessionEmpty(false);
		} 
	},
	
	/**
	 * Method called when a media source is added 
	 * @param e {Object} The event details
	 */
	onMediaSourceAdded: function(e) {
		if (this.getMediaSource() == null && e.synched === true) {
			//no current media source and a media source was just added
			this.loadDefaultTrackSession();
		} 
	},

	/**
	 * Method called when a media source is removed
	 * @param e {Object} The event details
	 */
	onMediaSourceRemoved: function(e) {
		if (this.getMediaSource() != null && e.id == this.getMediaSource().id) {
			//the media source we were using was just removed
			this.setMediaSource(null);
			this.loadDefaultTrackSession();
		}
	},
});
