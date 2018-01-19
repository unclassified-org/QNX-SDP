/**
 * The coverflow item component represents a song as an album cover.
 * @author lgreenway@lixar.com
 *
 * $Id: CoverflowItem.js 6093 2013-04-23 14:08:56Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.common.CoverflowItem', {
	extend: 'Ext.Img',
	xtype: 'coverflowItem',

	config: {
		idx: 0,

		song: null,
	},
	
	initialize: function() {
		this.callParent(arguments);
	},
	
	/**
	 * song configuration update hook. Updates the component's background with the song's artwork URL.
	 * @param newSong {String} The new song being set.
	 * @param oldSong {String} The previous song.
	 * @private
	 */
	updateSong: function(newSong, oldSong) {
		artSrc = '';
		
		if(newSong.get('artwork') && newSong.get('artwork').toLowerCase() != 'null')
		{
			artSrc = newSong.get('artwork');
		}

		// We set the background image directly on the element since this is faster
		// than going through the src property setter.
		this.element.dom.style.backgroundImage = artSrc ? 'url(' + artSrc + ')' : '';
	},
});