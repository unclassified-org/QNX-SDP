/**
 * The abstract Media controller. This controller is extended by either the mmcontrol,
 * or mmplayer Media controllers, depending on current application profile.
 * @author mlapierre
 *
 * $Id: Media.js 7262 2013-09-26 16:08:50Z nschultz@qnx.com $
 */
Ext.define('Home.controller.Media', {
	extend: 'Ext.app.Controller',
	
	config: {
		refs: {
			media				: 'mediaWidget', 
			source				: 'mediaWidget container[action="source"]',
			songTitle			: 'mediaWidget container[action="songtitle"]',
			artist				: 'mediaWidget container[action="artist"]',
			album				: 'mediaWidget container[action="album"]',
			progressBar			: 'mediaWidget container[action="progressbar"]',
			progressBarHighlight: 'mediaWidget container[action="progressbarHighlight"]',
			progressTime		: 'mediaWidget container[action="progresstime"]',
			mediaDetails		: 'mediaWidget container[action="mediadetails"]',
			nothingPlaying		: 'mediaWidget container[action="nothingplaying"]',
			nowPlaying			: 'mediaWidget container[action="nowplaying"]',
			albumArt			: 'mediaWidget image[action=albumart]',
		}
	},
	
	/**
	 * Stores the current song duration.
	 * @private
	 */
	currentSongDuration: 0,
	
	/**
	 * Initializes the controller on app startup
	 */
	init: function() {
	},	

	/**
	 * Method called when app is ready to launch
	 */
	launch: function() {
	},
	
	/**
	 * Updates the state of the media widget to display the current media information, or to indicate that there
	 * is currently no media playing.
	 * @param {Boolean} [show=true] True to display current media information, false to indicate no media.
	 */
	showNowPlaying: function(show) {
		if(show || show === undefined) {
			this.getMediaDetails().setActiveItem(this.getNowPlaying());
		} else {
			this.getMediaDetails().setActiveItem(this.getNothingPlaying());
			this.updateSource({});
			this.updateSong({});
		}
	},
	
	/**
	 * Update the displayed media source.
	 * @param {String} name The source name.
	 * @param {String} type The source type.
	 */
	updateSource: function(source) {
		this.getSource().setHtml(source.name || '');
		this.getSource().setCls([ 'media-source', source.type ? 'media-source-' + source.type : '' ]);
	},
	
	/**
	 * Update the displayed song.
	 * @param {Object} song The song object.
	 */
	updateSong: function(song) {
		if (song) {
			this.currentSongDuration = (song.duration || 0);
			
			this.getSongTitle().setHtml(Ext.util.Format.htmlEncode(song.title) || 'Untitled');
			this.getArtist().setHtml(Ext.util.Format.htmlEncode(song.artist) || 'Unknown Artist');
			this.getAlbum().setHtml(Ext.util.Format.htmlEncode(song.album) || 'Unknown Album');
			
			// Update the progress time/bar display
			this.updateProgress(0);
			
			this.getAlbumArt().setSrc(song.artwork || null);
		}
	},
	
	/**
	 * Updates the progress time and highlight bar based on the duration of the current song.
	 * @param {Number} position The position in milliseconds.
	 */
	updateProgress: function(position) {
		this.getProgressBarHighlight().setWidth((this.currentSongDuration > 0 ? position / this.currentSongDuration * 100 : 0) + "%");
		this.getProgressTime().setHtml(this.formatDuration(position / 1000) + ' / ' + this.formatDuration(this.currentSongDuration / 1000));
	},
	
	/**
	 * Formats a duration into a user readable format
	 * Ex: 60 => 1:00
	 * @param s {Number} The duration in seconds
	 * @returns {Number} The duration in common time
	 */
	formatDuration: function(s) {
		//TODO move this to the framework somewhere
		if (s == null || s <= 0) {
			return "0:00";
		}

		var out = "";
		s = Math.floor(s);

		var h = Math.floor(s / 3600);
		if (h > 0) {
			s -= h * 3600;
			out = h + ":";
		}

		var m = Math.floor(s / 60);
		if (m > 0) {
			s -= m * 60;
			if (m < 10 && h > 0) {
				out += "0";
			}
			out += m + ":";
		} else if (h > 0) {
			out += "00:";
		} else {
			out = "0:";
		}

		if (s < 10) {
			out += "0";
		}

		out += s;
		return out;
	},
	
});

