/**
 * A logical grouping of all the "now playing" elements on the audio view
 * @author mlapierre
 *
 * $Id: NowPlaying.js 7262 2013-09-26 16:08:50Z nschultz@qnx.com $
 */
Ext.define('MediaPlayer.view.audio.NowPlaying', {
	extend: 'Ext.Container',
	xtype: 'audioNowPlaying',

	requires: [
		'MediaPlayer.view.common.ProgressBar',
		'MediaPlayer.view.util.Media'
	],
	/*Cached references to the html elements*/
	source:			null,
	title:			null,
	album:			null,
	artist:			null,
	progressTime:	null,
	progressBar:	null,


	config: {
		layout: 'card',
		cls: 'music-nowplaying',
		
		listeners: {
			initialize: function() {
				this.initializeComponentReferences();
				this.on('updatedata', this.onUpdateData);
			}
		},
		items: [{
			layout: 'vbox', 
			scroll: false,
			cls: 'music-nowplaying-active',
			items: [
				{
					action: 'source',
					cls: 'nowplaying-source',
				},{
					action: 'title',
					cls: 'nowplaying-songtitle',
				},{
					action: 'artist',
					cls: 'nowplaying-artist',
				},{
					action: 'album',
					cls: 'nowplaying-album',
				},{
					action: 'progressbar',
					xtype: 'progressbar',
					cls: 'progressbar nowplaying-progressbar'
				},{
					action: 'progresstime',
					html: '0:00 / 0:00',
					cls: 'nowplaying-progresstime',
				}
			],
		},{
			cls: 'music-nowplaying-disabled',
			html: 'No songs selected.'
		}],

	},
	
	/**
	 * Switches the component between its empty and non-empty states.
	 * @param hasTrack {Boolean} True if there's a track to be displayed, false if not.
	 * @private
	 */
	setHasTrack: function(hasTrack) {
		if (hasTrack) {
			this.setActiveItem(this.getAt(0));
		} else {
			this.setActiveItem(this.getAt(1));
		}
	},
	/**
	 * updatedata handler. Updates the component based on its set record.
	 * @param {Object} component The component instance.
	 * @param {Object} data The new data.
	 * @private
	 */
	onUpdateData: function(component, data) {
		// Normally we'd use the data argument to access the updated data, but we want to be sure
		// that we're working with a NowPlaying instance since we can then make some assumptions about
		// the structure of that data, so we'll fetch the record for this component and use that, instead.
		var nowPlaying = component.getRecord();
		
		if(nowPlaying instanceof MediaPlayer.model.NowPlaying
			&& nowPlaying.get('mediaNode') instanceof MediaPlayer.model.MediaNode) {
			// We at least have a node, which means there's a current track
			this.setHasTrack(true);

			// Get the media node, metadata, and the node's media source
			var mediaNode = nowPlaying.get('mediaNode'),
				metadata = mediaNode.get('metadata'),
				mediaSource = Ext.getStore('MediaSources').findRecord('id', mediaNode.get('mediaSourceId'));

			// Get the media source name, type class, track title, artist, album, duration, and position
			var mediaSourceName = mediaSource ? mediaSource.get('name') : '',
				mediaSourceTypeCls = mediaSource ? this.getMediaSourceClassName(mediaSource.get('type')) : '',
				title = metadata ? Ext.util.Format.htmlEncode(metadata.get('title')) : Ext.util.Format.htmlEncode(mediaNode.get('name')),
				artist = metadata ? Ext.util.Format.htmlEncode(metadata.get('artist')) : '',
				album = metadata ? Ext.util.Format.htmlEncode(metadata.get('album')) : '',
				duration = metadata ? Ext.util.Format.htmlEncode(metadata.get('duration')) : 0,
				position = nowPlaying.get('position');
			
			// Media source
			this.source.setHtml(mediaSourceName);
			this.source.setCls(['x-container', 'nowplaying-source', mediaSourceTypeCls]);
			
			// Track
			this.title.setHtml(title || 'Untitled');
			this.artist.setHtml(artist || 'Unknown Artist');
			this.album.setHtml(album || 'Unknown Album');

			// Progress
			// We at least need the track duration in order to show any progress. In addition to that, the media
			// source should also support the position capability.
			if(duration > 0 && mediaSource.hasCapability('position')) {
				this.progressTime.setHidden(false);
				this.progressBar.setHidden(false);
				
				this.progressTime.setHtml(MediaPlayer.view.util.Media.formatDuration(position / 1000) + ' / ' +
						MediaPlayer.view.util.Media.formatDuration(duration / 1000));
				this.progressBar.setProgress(Math.round(position / duration * 100));
			} else {
				// Hide the progress time and bar
				this.progressTime.setHidden(true);
				this.progressBar.setHidden(true);
				
				// Reset progress time and bar data
				this.progressTime.setHtml('0:00 / 0:00');
				this.progressBar.setProgress(0);
			}
		} else {
			// No node means there's no current track
			this.setHasTrack(false);
		}
	},

	/**
	 * Initializes some cached component references for quick access.
	 * @private
	 */
	initializeComponentReferences: function(){
		/*Cache theses references so we don't need to query them every update*/
		this.source =		this.down('[action=source]');
		this.title =		this.down('[action=title]');
		this.album =		this.down('[action=album]');
		this.artist =		this.down('[action=artist]');
		this.progressTime =	this.down('[action=progresstime]');
		this.progressBar =	this.down('[action=progressbar]');
	},

	/**
	 * Returns the media source class name used for styling purposes based on the given media source type value.
	 * @param {Number} mediaSourceType The media source type.
	 * @returns {String} The class name for the given type.
	 * @private
	 */
	getMediaSourceClassName: function(mediaSourceType) {
		var className = '';
		
		switch(mediaSourceType) {
			case car.mediaplayer.MediaSourceType.HDD: className = 'media-source-hdd'; break;
			case car.mediaplayer.MediaSourceType.USB: className = 'media-source-usb'; break;
			case car.mediaplayer.MediaSourceType.IPOD: className = 'media-source-ipod'; break;
			case car.mediaplayer.MediaSourceType.DLNA: className = 'media-source-dlna'; break;
			case car.mediaplayer.MediaSourceType.BLUETOOTH: className = 'media-source-bluetooth'; break;
			case car.mediaplayer.MediaSourceType.MTP: className = 'media-source-mtp'; break;
		}
		
		return className;
	}
	
});