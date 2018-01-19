/**
 * The mmcontrol Media controller.
 * @author lgreenway
 *
 * $Id: Media.js 7083 2013-09-05 17:50:48Z mlapierre@qnx.com $
 */
Ext.define('Home.controller.mmcontrol.Media', {
	extend: 'Home.controller.Media',
	
	config: {
	},
	
	/**
	 * Current media source.
	 * @private
	 */
	currentSource: null,
	
	/**
	 * Initializes the controller on app startup
	 */
	init: function() {
	},	

	/**
	 * Method called when app is ready to launch
	 */
	launch: function() {
		//setup audio event listeners
		if (window.cordova) {
			document.addEventListener("audioplayerupdate", this.onAudioEvent.bind(this));
			document.addEventListener("audioplayertrack",this.onTrackChangeEvent.bind(this));
		} else {
			blackberry.event.addEventListener("audioplayerupdate", this.onAudioEvent.bind(this));
			blackberry.event.addEventListener("audioplayertrack",this.onTrackChangeEvent.bind(this));
		}

		var sources = qnx.mediasource.get();
		var source;

		//default to local storage, if it exists
		if (sources && sources.dbmme) {
			source = sources.dbmme;
		} else {
			//local storage doesn't exist. default to first available source
			var keys = Object.keys(sources);
			if (keys && keys.length > 0) {
				source = sources[keys[0]];
			} else {
				//there are no media sources available
				source = null;
			}
		}
		
		if (source) {
			this.currentSource = source;
			this.updateSource(source);
		
			//update the song
			var fid = qnx.audioplayer.getFid();
			if (fid > 0) {
				var song = qnx.medialibrary.getSong(source, fid);
				if (song) {
					this.updateSong(song);
					this.showNowPlaying(true);
				}
			}
		}
	},

	/**
	 * Method called when pps event is fired on the media player's audio context
	 * @param event {Object} The event details
	 */
	onAudioEvent: function(event) {
		if (event) {
			if (event.dbpath) {
				var source = this.findSource(event.dbpath);
				if (source) {
					this.currentSource = source;
					this.updateSource(source);
					if (!isNaN(event.fid) && event.fid > 0) {
						this.showNowPlaying(true);
					} else {
						this.showNowPlaying(false);
					}
				}
			}

			if (event.fid) {
				var song = qnx.medialibrary.getSong(this.currentSource, event.fid);
				this.updateSong(song);
			}
			
			if (event.position) {
				this.updateProgress(event.position);
			}
		}
	},
	
	/**
	 * Method called when the current track is changed remotely 
	 * @param event {Object} The event details
	 */
	onTrackChangeEvent: function(event) {
		if (event && !isNaN(event.index)) {
			var song = qnx.medialibrary.getSong(this.currentSource, event.fid);
			this.updateSong(song);
		}
	},
	
	/**
	 * Find the media source object from its path
	 * @param db {String} The db path to the media source
	 * @returns The media source object
	 */
	findSource: function(db) {
		if (db) {
			var sources = qnx.mediasource.get();
			for (var i in sources) {
				if (sources[i].db == db) {
					return sources[i];
					break;
				}
			}
		}
		return null;
	}
});

