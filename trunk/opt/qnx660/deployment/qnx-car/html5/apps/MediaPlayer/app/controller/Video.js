/**
 * The controller responsible for the video view.
 * @author mlapierre
 *
 * $Id: Video.js 6632 2013-06-20 15:18:00Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.controller.Video', {
	extend: 'MediaPlayer.controller.Media',

	config: {
		refs: {
			index				: 'videoView',
			
			title				: 'videoView container[action="title"]',
			progressBar			: 'videoView container[action="progressbar"]',
			progressTime		: 'videoView container[action="progresstime"]',
			
			backButton			: 'videoView button[action="back"]',
			playButton			: 'videoView button[action="play"]',
			pauseButton			: 'videoView button[action="pause"]',
			skipButton			: 'videoView button[action="skip"]',
			fullscreenButton	: 'videoView button[action="fullscreen"]',
			
			video				: 'videoView video',
			
			menuShowButton		: 'videoView menuShowButton',
			
			mainMenu			: 'menuView',
		},
		control: {
			backButton: {
				release: function() { 
					var index = (this.getPlaylistIndex() == 0) ? this.playlistStore.getCount() - 1 : this.getPlaylistIndex() - 1;
					this.playAt(index);
				}
			},
			playButton: {
				release: 'onPlay',
			},
			pauseButton: {
				release: 'onPause',
			},
			skipButton: {
				release: function() { 
					var index = (this.getPlaylistIndex() + 1 >= this.playlistStore.getCount()) ? 0 : this.getPlaylistIndex() + 1;
					this.playAt(index);
				}
			},
			progressBar: {
				seek: 'onSeek'
			},
			/*
			fullscreenButton: {
				tap: 'onFullScreenButtonTap',
			},
			*/
			video: {
				timeupdate: 'onVideoTimeUpdate',
				ended: 'onVideoEnded',				
			}
		},
		playlistIndex: 0,
		doStop: false,
		mediaSource: null,
		isLoadingDefault: false,
	},

	/**
	 * Initializes the controller on app startup
	 */
	init: function() {
		this.getApplication().on({
			video_index		: this.onVideoIndex,
			video_play		: this.onVideoPlay,
			
			audio_index		: this.onStop,
			audio_play		: this.onStop,
			radio_index		: this.onStop,
			pandora_index	: this.onStop,
			app_hide		: this.onStop,
			home_index		: this.onStop,
			pause_event		: this.onStop,

			mediasource_added	: this.onMediaSourceAdded,
			mediasource_removed	: this.onMediaSourceRemoved,
			
			scope			: this
		});
		
		this.playlistStore = Ext.getStore('VideoPlaylist');
		this.playlistStore.on('clear', this.onPlaylistCleared, this);
		this.playlistStore.on('addrecords', this.onPlaylistFilled, this);
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

		//sencha bug hack
		this.showVideo();

		this.getSkipButton().element.on({
			scope: this
		});

		this.getBackButton().element.on({
			scope: this
		});

		// Attach durationchange handler to the video element so we can know when the video is ready to be rendered
		this.getVideo().media.dom.addEventListener('durationchange', this.videoDurationChanged.bind(this));

		//sencha bug hack
		this.loadDefaultPlaylist();
	},
	
	/**
	 * Load the default (local) video playlist
	 */
	loadDefaultPlaylist: function() {	
		//make sure we only call this when needed
		if (this.getMediaSource() != null || this.getIsLoadingDefault()) {
			return;
		}

		try {
			this.setIsLoadingDefault(true);

			//set paused state
			this.onPause();
			
			//clear the current playlist
			this.setPlaylistIndex(0);
			this.playlistStore.removeAll();

			//set default library
			var sources = qnx.mediasource.get();

			//default to local storage, if it exists
			if (sources && sources.dbmme) {
				var videos = qnx.medialibrary.getVideos(sources.dbmme);
				if (videos && videos.length > 0) {
					this.loadMediaSource(sources.dbmme, videos);
					return;
				}
			}
		
			//local storage doesn't exist. default to first available source
			var keys = Object.keys(sources);
			if (keys && keys.length > 0) {
				for (var i=0; i<keys.length; i++) {
					var mediaSource = sources[keys[i]];
					var videos = qnx.medialibrary.getVideos(mediaSource);
					if (videos && videos.length > 0) {
						this.loadMediaSource(mediaSource, videos);
						return;
					}
				}
			}	

			//there are no media sources available
			this.setActiveVideo(null);
		} finally {
			this.setIsLoadingDefault(false);
		}
	},

	/**
	 * Loads a verified and valid media source
	 * @param mediaSource {Object} The media source to load
	 * @param videos {Array} The videos for the given media source
	 */
	loadMediaSource: function(mediaSource, videos) {
		//songs found, save the current media source
		this.setMediaSource(mediaSource);

		//load the playlist
		this.playlistStore.add(videos);
		videos = this.playlistStore.getRange();

		//display the information for the default track
		this.setActiveVideo(videos[0]);
	},
	
	/**
	 * Sets up the view to play a specific video
	 * @param video {Object} The video to set as current
	 */
	setActiveVideo: function(video) {
		this.currentVideo = video;

		// Hide the video until it's ready to be rendered
		this.hideVideo();

		if (video != null) {
			//display metadata
			this.getTitle().setHtml(video.get('title'));
			
			//load video
			var filename = qnx.medialibrary.getFilePath(this.getMediaSource(),video.get('fid'));
			
			this.getVideo().updateUrl(["file:///apps/mediasources/{0}/{1}".format(this.getMediaSource().id, filename)]);
			
   			this.currentDuration = this.formatDuration(video.get('duration') / 1000);
			this.getProgressBar().setProgress(0);
			this.getProgressTime().setHtml('0:00 / ' + this.currentDuration);
		} else {
			this.currentDuration = '0:00';
			this.getTitle().setHtml("There are no videos.");
			this.getProgressBar().setProgress(0);
			this.getProgressTime().setHtml('0:00 / 0:00');
		}
	},
	
	/**
	 * Shows the main video view
	 * @protected
	 */
	onVideoIndex: function() {
		Ext.Viewport.setActiveItem(this.getIndex());
	},
	
	/**
	 * Progress bar seek event handler. Seeks to the position reported in the event data.
	 * @param {MediaPlayer.view.common.ProgressBar} progressBar The progress bar component which fired the event.
	 * @param {Number} position The position of the seek, in percentage.
	 */
	onSeek: function(progressBar, position) {
		if (this.playlistStore.getCount() > 0) {
			this.getVideo().setCurrentTime(this.getVideo().getDuration() * (position / 100));
		}
	},
	
	/**
	 * Play a video from the current playlist
	 * @param {Number} index The index of the video to play in the current playlist
	 */
	playAt: function(index) {
		var video = this.playlistStore.getAt(index);
		if (video) {
			this.setPlaylistIndex(index);
			this.setActiveVideo(video);
		
			try {
				this.setDoStop(true);
				setTimeout(function() {
					//execute this later to ensure that DOM changes are applied first
					this.getVideo().play();
				}.bind(this), 0);
			} catch (err) {
				console.log('error playing video', err);
			}
			
			if (this.getPauseButton().getHidden()) {
				this.getPauseButton().setHidden(false);
				this.getPlayButton().setHidden(true);
			}
		}
	},
	
	/**
	 * Method called on a local play event
	 */
	onPlay: function() { 
		if (this.playlistStore.getCount() > 0) {
			this.getPauseButton().setHidden(false);
			this.getPlayButton().setHidden(true);
			try {
				this.getVideo().play();
				this.setDoStop(true);
			} catch (err) {
				console.log('error playing video', err);
			}
		}
	},
	
	/**
	 * Method called on a local pause event
	 */
	onPause: function() { 
		this.getPauseButton().setHidden(true);
		this.getPlayButton().setHidden(false);
		if (this.playlistStore.getCount() > 0) {
			try {
				this.getVideo().pause();
			} catch (err) {
				console.log('error pausing video', err);
			}
		}
	},
	
	/**
	 * Method called when we want to stop the video
	 * @param event {Object} The event details
	 */
	onStop: function(event) {
		//note: this medthod is in as a fix to PR 216642
		//normally video should be paused, not stopped
		
		if (this.getDoStop() && this.playlistStore.getCount() > 0) {
			this.setDoStop(false);
			this.getPauseButton().setHidden(true);
			this.getPlayButton().setHidden(false);
			try {
				this.getVideo().stop();
				//there's no stop in html5 video, so we need to fake it
				this.setActiveVideo(this.playlistStore.getAt(this.getPlaylistIndex()));
				
			} catch (err) {
				console.log('error stopping video', err);
			}
		}
	},
	
	/**
	 * Method called when a global "video_play" event is fired
	 * @param event {Object} The event details
	 * @protected
	 */
	onVideoPlay: function(event) {
		if (event && event.data && event.data.source && event.data.index > -1) {
			this.setMediaSource(event.data.source);
			this.onVideoIndex();
			this.playAt(event.data.index);
		}
	},
	
	/**
	 * Method called when the fullscreen button is tapped
	 */
	onFullScreenButtonTap: function() {
		this.getVideo().media.dom.webkitEnterFullscreen();
	},

	/**
	 * Method called when a time update is dispatched on the video object
	 * @param video {Object} The video object
	 * @param time {Number} The current time in seconds
	 * @param opts {Object} The options object passed to Ext.util.Observable.addListener
	 */
	onVideoTimeUpdate: function(video, time, opts) {
		this.getProgressBar().setProgress(time / this.getVideo().getDuration() * 100);
		this.getProgressTime().setHtml(this.formatDuration(time) + ' / ' + this.currentDuration);
	},	

	/**
	 * Method called when video playback ends naturally
	 * @param video {Object} The video object
	 * @param time {Number} The time at which the media ended at in seconds
	 * @param opts {Object} The options object passed to Ext.util.Observable.addListener
	 */
	onVideoEnded: function(video, time, opts) {
	
		this.getPauseButton().setHidden(true);
		this.getPlayButton().setHidden(false);
		
		/*
			Get the index of the current playlist
			increment the index and check if it's over the playlistcount if it is set it to zero
			if the index is GREATER than zero play the next
			else stop playback, assuming repeat isn't desired...could make a check to see if there is repeat in the future
		*/
		
		var index = (this.getPlaylistIndex() + 1 >= this.playlistStore.getCount()) ? 0 : this.getPlaylistIndex() + 1;
		if(index > 0){
			this.playAt(index);
		}else{
			this.getPauseButton().setHidden(true);
			this.getPlayButton().setHidden(false);
			this.setPlaylistIndex(index);
			this.setActiveVideo(this.playlistStore.getAt(index));
		}
	},	

	/**
	 * Method called when a media source is added 
	 * @param e {Object} The event details
	 */
	onMediaSourceAdded: function(e) {
		if (this.getMediaSource() == null && e.synched === true) {
			this.loadDefaultPlaylist();
		} 
	},

	/**
	 * Method called when a media source is removed
	 * @param e {Object} The event details
	 */
	onMediaSourceRemoved: function(e) {
		if (this.getMediaSource() != null && e.id == this.getMediaSource().id) {
			this.setMediaSource(null);
			this.getVideo().stop();
			this.loadDefaultPlaylist();
		}
	},

	
	/**
	 * Updates the HMI based on if the playlist is empty or not
	 * @param song {Object} The new song
	 */
	setPlaylistEmpty: function(isEmpty) {
		this.getPlayButton().setDisabled(isEmpty);
		this.getPauseButton().setDisabled(isEmpty);
		this.getBackButton().setDisabled(isEmpty);
		this.getSkipButton().setDisabled(isEmpty);
		this.getFullscreenButton().setDisabled(isEmpty);
	},
	
	/**
	 * Method called when the playlist store is cleared
	 * @param store {Object} A reference to the playlist store
	 * @param opts {Object} The options object passed to the listener
	 */
	onPlaylistCleared: function(store, opts) {
		this.setPlaylistEmpty(true);
	},
	
	/**
	 * Method called when records are added to the playlist store
	 * @param store {Object} A reference to the playlist store
	 * @param records {Object} An array of the added records
	 * @param opts {Object} The options object passed to the listener
	 */
	onPlaylistFilled: function(store, records, opts) {
		if (records && records.length > 0) {
			this.setPlaylistEmpty(false);
		} 
	},

	/**
	 * Video element durationchange handler. This event is fired when the video is loaded and ready to be rendered.
	 * Unhides the video element.
	 * @private
	 */
	videoDurationChanged: function() {
		// This resolves JI242244 where the loading curtain and or background was visible through the 'hole' created
		// by the video element.
		setTimeout(this.showVideo.bind(this),250);
	},

	/**
	 * Hides the video element.
	 * @private
	 */
	hideVideo: function() {
		this.getVideo().media.dom.style.display = 'none';
	},

	/**
	 * Shows the video element.
	 * @private
	 */
	showVideo: function() {
		this.getVideo().media.dom.style.display = '';
	},

	
});
