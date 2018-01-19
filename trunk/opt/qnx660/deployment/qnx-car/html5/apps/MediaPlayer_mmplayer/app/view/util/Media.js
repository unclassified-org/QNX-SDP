/**
 * Media utility class. Contains common functions for displaying media information.
 * @author lgreenway
 *
 * $Id: Media.js 7179 2013-09-13 19:29:55Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.util.Media', {
	singleton: true,
	
	/**
	 * Formats a duration into a user readable format
	 * Ex: 60 => 1:00
	 * @param s {Number} The duration in seconds
	 * @returns {String} The duration in common time
	 */
	formatDuration: function(s) {
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
			out += "00:"
		} else {
			out = "0:";
		}

		if (s < 10) {
			out += "0";
		}

		out += s;
		return out;
	},
	
	/**
	 * Returns the display name of the media source for use in menu lists.
	 * @param data {Object} The media source data object.
	 * @return {String} The display name of the media source.
	 */
	getMediaSourceMenuListName: function(data) {
		var name = data.name;
		
		// Check if there's more than one media source which shares the same device UID
		var mediaSources = Ext.getStore('MediaSources').queryBy(function(record) {
			return record.get('name') === data.name && record.get('uid') === data.uid;
		});
		
		// If so, we append the media source's 'viewName' property in parentheses so we can distinguish
		// between the duplicate media sources.
		if(mediaSources.getCount() > 1) {
			var viewName = data.viewName === 'LIVE' ? 'Folders' :
							data.viewName === 'SYNCED' ? 'Synced' :
							data.viewName;
			name += ' (' + viewName + ')';
		}
		
		return name;
	},
	
	/**
	 * Returns the appriate menu image CSS class name based on the media source's type.
	 * @param {Number} mediaSourceType The media source type value.
	 * @return {String} The CSS class name for the type.
	 */
	getMediaSourceMenuImageClassName: function(mediaSourceType) {
		var className = '';
		switch(mediaSourceType) {
			case car.mediaplayer.MediaSourceType.HDD: className = 'menu-image-hdd'; break;
			case car.mediaplayer.MediaSourceType.USB: className = 'menu-image-usb'; break;
			case car.mediaplayer.MediaSourceType.IPOD: className = 'menu-image-ipod'; break;
			case car.mediaplayer.MediaSourceType.DLNA: className = 'menu-image-dlna'; break;
			case car.mediaplayer.MediaSourceType.BLUETOOTH: className = 'menu-image-bluetooth'; break;
			case car.mediaplayer.MediaSourceType.MTP: className = 'menu-image-mtp'; break;
			
			case MediaPlayer.model.MediaSource.TYPE_RADIO: className = 'menu-image-radio'; break;
		}
		return className;
	},
	
	/**
	 * Returns the appropriate menu item CSS class name based on the media node type or extended metadata folder_type property.
	 * @param {Number} nodeType The media node type value.
	 * @param {MediaPlayer.model.Metadata} metadata The node's metadata.
	 * @return {String} The CSS class name for the type.
	 */
	getNodeTypeMenuImageClassName: function(nodeType, metadata) {
		var className = '';
		
		// Use basic node type classes first
		switch(nodeType) {
			case car.mediaplayer.MediaNodeType.FOLDER: className = 'menu-image-folder'; break;
			case car.mediaplayer.MediaNodeType.AUDIO: className = 'menu-image-song'; break;
			case car.mediaplayer.MediaNodeType.VIDEO: className = 'menu-image-video'; break;
		}

		// Then, if we have metadata and a folder_type property, use that
		if(nodeType === car.mediaplayer.MediaNodeType.FOLDER
				&& metadata && metadata.get('folder_type')) {
			switch(metadata.get('folder_type')) {
				case 'album': className = 'menu-image-album'; break;
				case 'artist': className = 'menu-image-artist'; break;
				case 'genre': className = 'menu-image-genre'; break;
				case 'song': className = 'menu-image-song'; break;
				case 'video': className = 'menu-image-video'; break;
			}
		}
		
		return className;
	},
	
	/**
	 * Returns a background-image CSS style definition based on the supplied media node metadata.
	 * @param {MediaPlayer.model.Metadata} metadata The node's metadata.
	 * @return {String} A background-image CSS style definition, or an empty string if no metadata or artwork is present.
	 */
	getNodeArtworkStyle: function(metadata) {
		var style = '';
		if(metadata instanceof MediaPlayer.model.Metadata
			&& metadata.get('artwork')) {
			style = 'background-image: url(\'' + encodeURI(metadata.get('artwork')).replace('\'', '\\\'') + '\')';
		}
		return style;
	}
});