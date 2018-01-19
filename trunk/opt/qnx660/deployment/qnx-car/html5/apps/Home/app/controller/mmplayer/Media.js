/**
 * The mmplayer Media controller.
 * @author lgreenway
 *
 * $Id: Media.js 7891 2013-12-13 18:58:10Z lgreenway@qnx.com $
 */
Ext.define('Home.controller.mmplayer.Media', {
	extend: 'Home.controller.Media',
	
	requires: [ 'Home.store.MediaSources' ],
	
	statics: {
		PLAYER_NAME: 'HMI'
	},
	
	config: {
	},
	
	/**
	 * The car.mediaplayer MediaPlayer instance.
	 * @private
	 */
	mediaPlayer: null,
	
	/**
	 * Local MediaSources store.
	 * @private
	 */
	mediaSources: null,
	
	/**
	 * Initializes the controller on app startup
	 */
	init: function() {
		// Create a MediaSources store
		this.mediaSources = Ext.create('Home.store.MediaSources');
	},

	/**
	 * Method called when app is ready to launch
	 */
	launch: function() {
		try{
			this.mediaPlayer = new car.mediaplayer.MediaPlayer(Home.controller.mmplayer.Media.PLAYER_NAME);
		} catch(ex) {
			// FIXME: This is a fatal exception
			console.error('Error creating media player instance with name: ' + Home.controller.mmplayer.Media.PLAYER_NAME);
		}
		
		if(this.mediaPlayer) {
			// Attach callbacks
			// Media source changes will manage the media sources store
			this.mediaPlayer.watchMediaSource(this.onMediaSourceChange.bind(this));
			
			// Track session changes will tell us if the current track session has been destroyed so that we can
			// hide the now playing information
			this.mediaPlayer.watchTrackSession(this.onTrackSessionChange.bind(this));
			
			// Track and track position changes will update the now playing information
			this.mediaPlayer.watchTrack(this.onTrackChange.bind(this));
			this.mediaPlayer.watchTrackPosition(this.onTrackPositionChange.bind(this));
			
			// Initialize media sources
			this.mediaPlayer.getMediaSources(function(data) {
				// Initialize the media source store with the results
				this.initializeMediaSources(data);
				
				// Now that we have the media sources, we can get the current track
				this.mediaPlayer.getCurrentTrack(this.onTrackChange.bind(this));
			}.bind(this));
		}
	},
	
	/**
	 * Populates the MediaSources store with media sources.
	 * @param {Array} data The array of media sources.
	 * @private
	 */
	initializeMediaSources: function(data) {
		// Route the addition of media sources through the onMediaSourceChange event
		var mediaSources = Ext.Array.from(data);
		for(var i = 0; i < mediaSources.length; i++) {
			this.onMediaSourceChange({
				type: car.mediaplayer.MediaSourceEvent.ADDED,
				mediaSource: mediaSources[i]
			});
		}
	},
	
	/**
	 * Handles the addition, modification, and removal of media sources in the the media sources store.
	 * @param {Object} data The event data.
	 * @private
	 */
	onMediaSourceChange: function(data) {
		if(typeof data === 'object'
			&& data.hasOwnProperty('type')
			&& data.hasOwnProperty('mediaSource')) {
			
			if(data.type === car.mediaplayer.MediaSourceEvent.ADDED) {
				// ADD media source
				var mediaSource = Ext.create('Home.model.MediaSource', data.mediaSource);
				this.mediaSources.add(mediaSource);
			} else if(data.type === car.mediaplayer.MediaSourceEvent.UPDATED) {
				// UPDATE media source
				// Find the media source by id
				var mediaSource = this.mediaSources.findRecord('id', data.mediaSource.id);
				
				if(mediaSource) {
					// Update the media source data
					mediaSource.set(data.mediaSource);
				} else {
					console.warn('Home.controller.mmplayer.Media::onMediaSourceChange - Unable to update media source ' +
							'with ID \'' + data.mediaSource.id + '\'. Media source not found.');
				}
			} else if(data.type === car.mediaplayer.MediaSourceEvent.REMOVED) {
				// REMOVE media source
				// Find the media source by id
				var mediaSource = this.mediaSources.findRecord('id', data.mediaSource.id);

				if(mediaSource) {
					// Remove the media source
					this.mediaSources.remove(mediaSource);
				} else {
					console.warn('Home.controller.mmplayer.Media::onMediaSourceChange - Unable to remove media source ' +
							'with ID \'' + data.mediaSource.id + '\'. Media source not found.');
				}
			}
		}
	},
	
	/**
	 * trackSessionChange watch handler. Hides the now playing information if the current track session has
	 * been destroyed.
	 * @param {Object} data The event data.
	 * @private
	 */
	onTrackSessionChange: function(data) {
		if(data && data.type === car.mediaplayer.TrackSessionEvent.DESTROYED) {
			this.showNowPlaying(false);
		}
	},
	
	/**
	 * getCurrentTrack success, and trackChange watch handler. Updates the source/song display.
	 * @param {Object} data The event data.
	 * @private
	 */
	onTrackChange: function(data) {
		var song = {},
			source = {};
		
		// Use the song metadata first, or fall back on the node name for the title
		song.title =    (data.metadata ? data.metadata.title : '')    || data.mediaNode.name;
		song.artist =   (data.metadata ? data.metadata.artist : '')   || '';
		song.album =    (data.metadata ? data.metadata.album : '')    || '';
		song.artwork =  (data.metadata ? data.metadata.artwork : '')  || '';
		song.duration = (data.metadata ? data.metadata.duration : '') || 0;
		
		// Update the song
		this.updateSong(song);
		
		// Attempt to get the MediaSource with the node's mediaSourceId
		var mediaSource = this.mediaSources.findRecord('id', data.mediaNode.mediaSourceId);
		
		if(mediaSource) {
			source.name = mediaSource.get('name');
			source.type = this.mediaSourceTypeToString(mediaSource.get('type'));
		} else {
			console.warn('Home.controller.mmplayer.Media::onTrackChange - Unable to find media source with ID: ' +
					data.mediaNode.mediaSourceId);
		}
		
		// Update the source
		this.updateSource(source);

		// Show/hide the progress bar/time based on the presence of track duration
		this.getProgressBar().setHidden(song.duration === 0);
		this.getProgressTime().setHidden(song.duration === 0);
		
		// If a track change event has occurred, this means there's now playing information to display. We show
		// this last so that the now playing elements have already been updated with the latest information.
		this.showNowPlaying(true);
	},
	
	/**
	 * trackPositionChange watch handler. Updates the progress display.
	 * @param {Object} data The event data.
	 * @private
	 */
	onTrackPositionChange: function(data) {
		if(data && typeof data.position === 'number') {
			this.updateProgress(data.position);
		}
	},
	
	/**
	 * Returns the specific media source type string for the 'media-source-*' class name.
	 * @param {Number} type The car.mediaplayer.MediaSourceType value.
	 * @return {String} The media source class name suffix.
	 * @private
	 */
	mediaSourceTypeToString: function(type) {
		var suffix = '';
		
		switch(type) {
			case car.mediaplayer.MediaSourceType.HDD: suffix = 'hdd'; break;
			case car.mediaplayer.MediaSourceType.USB: suffix = 'usb'; break;
			case car.mediaplayer.MediaSourceType.IPOD: suffix = 'ipod'; break;
			case car.mediaplayer.MediaSourceType.DLNA: suffix = 'dlna'; break;
			case car.mediaplayer.MediaSourceType.BLUETOOTH: suffix = 'bluetooth'; break;
			case car.mediaplayer.MediaSourceType.MTP: suffix = 'mtp'; break;
		}
		
		return suffix;
	}
	
});

