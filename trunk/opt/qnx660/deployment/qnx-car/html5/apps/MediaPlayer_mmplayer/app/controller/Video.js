/**
 * The controller responsible for the video view.
 * @author mlapierre
 *
 * $Id: Video.js 7595 2013-11-19 21:51:59Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.controller.Video', {
	extend: 'MediaPlayer.controller.Media',

	requires: ['MediaPlayer.view.util.Media'],

	config: {
		refs: {
			index: 'videoView',

			title: 'videoView container[action="title"]',
			progressBar: 'videoView container[action="progressbar"]',
			progressTime: 'videoView container[action="progresstime"]',

			backButton: 'videoView button[action="back"]',
			playButton: 'videoView button[action="play"]',
			pauseButton: 'videoView button[action="pause"]',
			skipButton: 'videoView button[action="skip"]',
			fullscreenButton: 'videoView button[action="fullscreen"]',

			video: 'videoView video',

			menuShowButton: 'videoView menuShowButton',

			mainMenu: 'menuView',
		},
		control: {
			backButton: {
				release: 'onBack'
			},
			playButton: {
				release: 'onPlay'
			},
			pauseButton: {
				release: 'onPause'
			},
			skipButton: {
				release: 'onSkip'
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
				play: 'updatePlaybackButtonStates',
				pause: 'updatePlaybackButtonStates',
				stop: 'updatePlaybackButtonStates',
			}
		},

		/**
		 * Stores the current video MediaNode.
		 * @private
		 */
		currentVideo: null
	},

	/**
	 * Initializes the controller on app startup
	 */
	init: function() {
		var eventMap = {
			video_index: this.onVideoIndex,

			audio_index: this.onPause,
			audio_play: this.onPause,
			radio_index: this.onPause,
			pandora_index: this.onPause,
			app_hide: this.onPause,
			home_index: this.onPause,
			pause_event: this.onPause,

			scope: this
		};

		eventMap[MediaPlayer.enumeration.ApplicationEvent.CMD_PLAY_VIDEO] = this.onPlayVideo;

		this.getApplication().on(eventMap);

		// Attach update and delete handlers to the MediaSources store so that if the media source disappears
		// or otherwise becomes unavailable, we can revert to the no video selected state.
		Ext.getStore('MediaSources').on({
			updaterecord: this.onMediaSourceUpdated,
			removerecords: this.onMediaSourceRemoved,

			scope: this
		});
	},

	/**
	 * Method called when app is ready to launch
	 */
	launch: function() {
		// Pause the video if the media menu is opened
		this.getMenuShowButton().element.on({
			touchstart: this.onPause,
			scope: this
		});

		//sencha bug hack
		this.showVideo();

		// Attach durationchange handler to the video element so we can know when the video is ready to be rendered
		this.getVideo().media.dom.addEventListener('durationchange', this.videoDurationChanged.bind(this));
		// Initialize the active video as nothing to init our view state
		this.setActiveVideo(null);

		// Initialize the playback button states
		this.updatePlaybackButtonStates();
	},

	/**
	 * Shows the main video view.
	 * @protected
	 */
	onVideoIndex: function() {
		Ext.Viewport.setActiveItem(this.getIndex());
	},

	/**
	 * Method called when a media source is updated.
	 * @param {Ext.data.Store} store The store which fired the event.
	 * @param {Ext.data.Model} record The Model instance that was updated.
	 */
	onMediaSourceUpdated: function(store, record) {
		if (this.currentVideo && record.get('id') === this.currentVideo.get('mediaSourceId') && record.get('ready') === false) {
			// The video's media source has become unavailable
			// Prompt the user to select new media
			this.promptMediaReselection();

			// Clear the active video
			this.setActiveVideo(null);
		}
	},

	/**
	 * Method called when a media source is removed.
	 * @param {Ext.data.Store} store The store which fired the event.
	 * @param {Ext.data.Model[]} records The Model instances that were removed.
	 */
	onMediaSourceRemoved: function(store, records) {
		if (this.currentVideo) {
			for (var i in records) {
				if (records[i].get('id') === this.currentVideo.get('mediaSourceId')) {
					// The video's media source has been removed
					// Prompt the user to select new media
					this.promptMediaReselection();

					// Clear the active video
					this.setActiveVideo(null);

					// No need to continue
					break;
				}
			}
		}
	},

	/**
	 * Shows the media selection menu if the video view is the active view.
	 * @private
	 */
	promptMediaReselection: function() {
		// Show the media selection menu if the video view is the active view
		if (Ext.Viewport.getActiveItem() === this.getIndex()) {
			this.getApplication().fireEvent('menu_show');
		}
	},

	/**
	 * Plays the specified video.
	 * @param {MediaPlayer.model.MediaNode} video The video media node to play.
	 * @protected
	 */
	onPlayVideo: function(video) {
		if (video && video instanceof MediaPlayer.model.MediaNode && video.get('type') === car.mediaplayer.MediaNodeType.VIDEO) {
			this.setActiveVideo(video);
		}
	},

	/**
	 * Sets up the view to play a specific video
	 * @param {MediaPlayer.model.MediaNode} video The video to set as current.
	 * @private
	 */
	setActiveVideo: function(video) {
		// If there's already a video playing, stop it
		if (this.currentVideo) {
			this.onStop();
		}
		// Update the current video
		this.currentVideo = video;
		if (this.currentVideo) {
			this.hideVideo();
			// load the metadata for the current video, we need this to get the url, if its already loaded, just play it
			if (this.currentVideo && this.currentVideo.get('metadata') !== undefined && this.currentVideo.get('metadata').get('url') !== undefined) {
				this.updateNowPlayingDetails();
				this.onPlay();
				this.showVideo();
			} else if (this.currentVideo) {
				this.currentVideo.on('metadataLoadSuccess', this.extendedMetadataLoadSuccess.bind(this));
				this.currentVideo.on('metadataLoadFailure', this.extendedMetadataLoadFailure.bind(this));
				this.currentVideo.loadMetadata(["url"]);
			}
		} else {
			this.updateNowPlayingDetails();
		}
	},

	/**
	 * Progress bar seek event handler. Seeks to the position reported in the event data.
	 * @param {MediaPlayer.view.common.ProgressBar} progressBar The progress bar component which fired the event.
	 * @param {Number} position The position of the seek, in percentage.
	 */
	onSeek: function(progressBar, position) {
		this.getVideo().setCurrentTime(this.getVideo().getDuration() * (position / 100));
	},

	/**
	 * Method called on a local play event
	 */
	onPlay: function() {
		try {
			this.getVideo().play();
		} catch (err) {
			console.log('error playing video', err);
		}
	},

	/**
	 * Method called on a local pause event
	 */
	onPause: function() {
		try {
			this.getVideo().pause();
		} catch (err) {
			console.log('error pausing video', err);
		}
	},

	/**
	 * Method called when we want to stop the video
	 * @param event {Object} The event details
	 */
	onStop: function(event) {
		//note: this medthod is in as a fix to PR 216642
		//normally video should be paused, not stopped
		try {
			if (this.currentVideo) {
				//there's no stop in html5 video, so we need to fake it
				if (this.getVideo().isPlaying() === true) {
					this.getVideo().setCurrentTime(0);
					this.getVideo().pause();
				}
				this.showVideo();
			}
		} catch (err) {
			console.log('error stopping video', err);
		}
	},

	onBack: function() {},

	onSkip: function() {},

	/**
	 * Updates the play, pause, next, and previous button visibility and disabled states based on the existence of an active
	 * video, and if that video is playing.
	 * @private
	 */
	updatePlaybackButtonStates: function() {
		// Back and Skip currently unused since we can only play one video at a time now
		this.getBackButton().setDisabled(true);
		this.getSkipButton().setDisabled(true);

		this.getPlayButton().setHidden(this.getVideo().isPlaying());
		this.getPlayButton().setDisabled(!this.currentVideo);

		this.getPauseButton().setHidden(!this.getVideo().isPlaying());
		this.getPauseButton().setDisabled(!this.currentVideo);
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
		// Sometimes the video time updates can come after the active video has been cleared. Checking if there is
		// a current video can prevent the progress bar/time from updating erroneously.
		if (this.currentVideo) {
			this.getProgressBar().setProgress(time / this.getVideo().getDuration() * 100);
			this.getProgressTime().setHtml(MediaPlayer.view.util.Media.formatDuration(time) +
				' / ' + MediaPlayer.view.util.Media.formatDuration(this.getVideo().getDuration()));
		}
	},

	/**
	 * Method called when video playback ends naturally
	 * @param video {Object} The video object
	 * @param time {Number} The time at which the media ended at in seconds
	 * @param opts {Object} The options object passed to Ext.util.Observable.addListener
	 */
	onVideoEnded: function(video, time, opts) {
		this.hideVideo();
		this.onStop();
	},

	/**
	 * Video element durationchange handler. This event is fired when the video is loaded and ready to be rendered.
	 * Unhides the video element.
	 * @private
	 */
	videoDurationChanged: function() {
		this.showVideo();
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
		// This resolves JI242244 where the loading curtain and or background was visible through the 'hole' created
		// by the video element. If the video is very large we may still see the 'hole' while its loading
		setTimeout(function() {
			this.getVideo().media.dom.style.display = '';
		}.bind(this), 500);
	},
	/**
	 * Updates the now playing details with the metadata from the current video
	 * @private
	 */
	updateNowPlayingDetails: function() {
		if (this.currentVideo !== null) {
			if (this.currentVideo.get('metadata') && this.getVideo().media.dom.childNodes[0].src != this.currentVideo.get('metadata').get('url')) {
				this.getTitle().setHtml(this.currentVideo.get('name'));
				this.getVideo().updateUrl([this.currentVideo.get('metadata').get('url')]);
			}
			this.getProgressBar().setSeekable(true);
			this.getProgressBar().setProgress(0);
			this.getProgressTime().setHtml('0:00 / ' + MediaPlayer.view.util.Media.formatDuration(this.getVideo().getDuration() || 0));
		} else {
			this.getTitle().setHtml("No video selected.");

			this.getProgressBar().setSeekable(false);
			this.getProgressBar().setProgress(0);
			this.getProgressTime().setHtml('0:00 / 0:00');

			// Update playback button states
			this.updatePlaybackButtonStates();
		}
	},
	/**
	 * Success callback for the load metadata method on the mediaNode
	 * @private
	 */
	extendedMetadataLoadSuccess: function() {
		// remove the event listener for cleanup
		this.currentVideo.un('metadataLoadSuccess', this.extendedMetadataLoadSuccess.bind(this));
		this.currentVideo.un('metadataLoadFailure', this.extendedMetadataLoadFailure.bind(this));
		this.updateNowPlayingDetails();
		this.onPlay();
		this.showVideo();
	},
	/**
	 * Failure callback for the load metadata method on the mediaNode
	 * @private
	 */
	extendedMetadataLoadFailure: function() {
		// remove the event listener for cleanup
		this.currentVideo.un('metadataLoadSuccess', this.extendedMetadataLoadSuccess.bind(this));
		this.currentVideo.un('metadataLoadFailure', this.extendedMetadataLoadFailure.bind(this));
		this.updateNowPlayingDetails();
		console.log("Could not load the extendedMetadata for the selected video");
		this.showVideo();
	}
});