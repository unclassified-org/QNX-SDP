/**
 * Contains elements to display information about the currently playing
 * track.
 * @author lgreenway@lixar.com
 *
 * $Id: NowPlaying.js 6609 2013-06-18 21:38:45Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.radio.pandora.NowPlaying', {
	extend: 'Ext.Container',
	xtype: 'pandoraNowPlaying',

	requires: [
		'MediaPlayer.view.common.ProgressBar',
		'MediaPlayer.view.util.Media'
	],

	config: {
		layout: {
			type: 'vbox',
			pack: 'end'
		},
		scroll: false,
		cls: 'pandora-nowplaying',

		items: [
			{
				action: 'artist',
				cls: 'nowplaying-artist',
			},{
				action: 'songtitle',
				cls: 'nowplaying-songtitle',
			},{
				action: 'album',
				cls: 'nowplaying-album',
			},{
				action: 'progressbar',
				xtype: 'progressbar',
				cls: 'progressbar nowplaying-progressbar',
				seekable: false
			},{
				action: 'progresstime',
				html: '0:00 / 0:00',
				cls: 'nowplaying-progresstime',
			}
		]
	},

	/**
	 * Updates the artist, title, and album information.
	 * @param trackName {String} The track name
	 * @param trackArtist {String} The track artist
	 * @param trackAlbum {String} The track album
	 */
	setTrackInfo: function(trackName, trackArtist, trackAlbum) {
		this.child('container[action=artist]').setHtml(trackArtist);
		this.child('container[action=songtitle]').setHtml(trackName);
		this.child('container[action=album]').setHtml(trackAlbum);
	},
	
	/**
	 * Updates the progress bar and elapsed/total time information.
	 * @param elapsedTime {Number} The elapsed time for the current track
	 * @param totalTime {Number} The total time of the current track
	 */
	setTrackProgress: function(elapsedTime, totalTime) {
		this.child('container[action=progresstime]').setHtml(MediaPlayer.view.util.Media.formatDuration(elapsedTime) +
				' / ' + MediaPlayer.view.util.Media.formatDuration(totalTime));
		this.child('container[action=progressbar]').setProgress(totalTime > 0 ? ((elapsedTime / totalTime) * 100) : 0);
	}
});