/**
 * The coverflow item component represents a song as an album cover.
 * @author lgreenway@lixar.com
 *
 * $Id: CoverflowItem.js 7035 2013-08-28 14:19:55Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.common.CoverflowItem', {
	extend: 'Ext.Img',
	xtype: 'coverflowItem',

	config: {
		idx: 0,
	},
	
	initialize: function() {
		this.callParent(arguments);
		
		this.on('updatedata', this.onUpdateData);
		this.on('error', this.onError);
		
		if(this.getRecord()) {
			this.onUpdateData(this, this.getRecord().getData());
		}
	},
	
	/**
	 * src configuration update hook. Clears the image if the new src value is empty.
	 * @param {String} newSrc The new src value.
	 */
	updateSrc: function(newSrc) {
		// Call parent update hook
		this.callParent(arguments);
		
		// Manually remove the background image style if the src is empty
		if(!newSrc) {
			this.element.dom.style.backgroundImage = '';
		}
	},
	
	/**
	 * updatedata handler. Updates the artwork for this coverflow item based on the artwork URL provided
	 * in the MediaNode's metadata.
	 * @param {Object} component This component.
	 * @param {Object} data The updated data.
	 * @private
	 */
	onUpdateData: function(component, data) {
		// Get the MediaNode record
		var mediaNode = this.getRecord(),
			metadata = null,
			artworkSrc = '';
		
		if(mediaNode instanceof MediaPlayer.model.MediaNode) {
			metadata = mediaNode.get('metadata');
			
			if(metadata instanceof MediaPlayer.model.Metadata) {
				artworkSrc = metadata.get('artwork');
			} else {
				// Load the metadata
				mediaNode.loadMetadata();
			}
		}
		
		this.setSrc(artworkSrc);
	},
	
	/**
	 * Triggered when the component fails to load the specified image. Clears the current image so the default
	 * album art can be displayed.
	 * @private
	 */
	onError: function() {
		this.setSrc('');
	}
});