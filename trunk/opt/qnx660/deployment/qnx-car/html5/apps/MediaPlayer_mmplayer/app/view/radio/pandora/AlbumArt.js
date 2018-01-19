/**
 * Displays the Pandora station's album artwork.
 * @author lgreenway@lixar.com
 *
 * $Id: AlbumArt.js 6093 2013-04-23 14:08:56Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.radio.pandora.AlbumArt', {
	extend: 'Ext.Component',
	xtype: 'pandoraAlbumArt',

	config: {
		cls: 'pandora-albumart',
		
		/**
		 * The album art URL. If set to empty, the component will revert to the default album artwork.
		 */
		artUrl: '',
	},
	
	/**
	 * artUrl property update hook.
	 * @param newValue {String} The new artwork URL.
	 * @param oldValue {String} The previous artwork URL.
	 * @private
	 */
	updateArtUrl: function(newUrl, oldUrl) {
		this.element.dom.style.backgroundImage = newUrl ? 'url(' + newUrl + ')' : '';
	},
});