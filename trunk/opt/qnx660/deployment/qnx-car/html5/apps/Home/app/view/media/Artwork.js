/**
 * Media album artwork component. Displays the supplied artwork source URL, or shows the default album artwork
 * if no artwork is present for the current media.
 * @author lgreenway
 *
 * $Id: Artwork.js 6506 2013-06-10 15:30:14Z lgreenway@qnx.com $
 */
Ext.define('Home.view.media.Artwork', {
	extend: 'Ext.Img',
	xtype: 'mediaArtwork',
	
	config: {
		cls: 'media-albumart',
	},
	
	/**
	 * Component initialization lifecycle handler.
	 */
	initialize: function() {
		this.callParent(arguments);

		// Attach error handler
		this.on('error', this.onError);
	},

	/**
	 * Clears the image on the component.
	 * @private
	 */
	clearImage: function() {
		this.element.dom.style.backgroundImage = '';
	},
	
	/**
	 * Component src configuration update hook. If the new src value is empty, clears the background image
	 * on the component so the default album art can be displayed.
	 * @param {String} newSrc The new src value.
	 */
	updateSrc: function(newSrc) {
		this.callParent(arguments);
		
		if(!newSrc) {
			this.clearImage();
		}
	},
	
	/**
	 * Component error handler. Sets the image source back to the default album artwork.
	 * @private
	 */
	onError: function() {
		this.clearImage();
	}
});