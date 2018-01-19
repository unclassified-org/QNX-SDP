/**
 * A logical grouping of all the "now playing" elements on the audio view
 * @author mlapierre
 *
 * $Id: NowPlaying.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.view.audio.NowPlaying', {
	extend: 'Ext.Container',
	xtype: 'audioNowPlaying',

	requires: [
		'MediaPlayer.view.common.ProgressBar',
	],

	config: {
		layout: 'card',
		cls: 'music-nowplaying',
		
		items: [{
			layout: 'vbox', 
			scroll: false,
			cls: 'music-nowplaying-active',
			items: [
				{
					action: 'source',
					cls: 'nowplaying-source',
				},{
					action: 'songtitle',
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
			html: 'There are no songs.'
		}]
	},
	
	/**
	 * Updates the HMI based on if the tracksession is empty or not
	 * @param song {Object} The new song
	 */
	setTracksessionEmpty: function(isEmpty) {
		if (isEmpty) {
			this.setActiveItem(this.getAt(1));
		} else {
			this.setActiveItem(this.getAt(0));
		}
	}
	
});