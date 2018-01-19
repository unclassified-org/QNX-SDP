/**
 * The JavaScript wrapper to the jPlayer JNEXT plugin.
 * @author lgreenway
 *
 * $Id: jPlayer.js 7618 2013-11-21 18:57:01Z nschultz@qnx.com $
 */

JNEXT.JPLAYER_ = function()
{
	/**
	 * Reference to this object.
	 * @private
	 */
	var self = this;

	// Define constants
	Object.defineProperties(self, {
		'JPLAYER_LIB_NAME':			{ value: 'jplayer', enumerable: true, writable: false },
		'JPLAYER_OBJ_NAME':			{ value: 'jplayer.jPlayer', enumerable: true, writable: false },
		'JPLAYER_INVOKE_SUCCESS':	{ value: 'Ok', enumerable: true, writable: false },
		'JPLAYER_INVOKE_ERROR':		{ value: 'Error', enumerable: true, writable: false }
	});
	
	// mm_player enumerations
	/**
	 * Track session event types.
	 */
	self.TrackSessionEvent = {};
	Object.defineProperties(self.TrackSessionEvent, {
		'CREATED':		{ value: 0, enumerable: true, writable: false },
		'DESTROYED':	{ value: 1, enumerable: true, writable: false },
		'APPENDED':		{ value: 2, enumerable: true, writable: false }
	});
	
	/**
	 * Media source statuses.
	 */
	self.MediaSourceStatus = {};
	Object.defineProperties(self.MediaSourceStatus, {
		'MS_STATUS_NOT_READY':	{ value: 0, enumerable: true, writable: false },
		'MS_STATUS_READY':		{ value: 1, enumerable: true, writable: false },
		'MS_STATUS_1STPASS':	{ value: 2, enumerable: true, writable: false },
		'MS_STATUS_2NDPASS':	{ value: 3, enumerable: true, writable: false },
		'MS_STATUS_3RDPASS':	{ value: 4, enumerable: true, writable: false }
	});
	
	
	/**
	 * The jPlayer object ID returned upon creation.
	 * @private
	 */
	var m_strObjId = null;
	
	/**
	 * Getter for the jPlayer JNEXT object instance ID.
	 * @returns {String} The jPlayer JNEXT object instance ID.
	 */
	self.getId = function() {
		return m_strObjId;
	};

	/**
	 * Initializes the jPlayer plugin.
	 * @private
	 */
	var init = function() {
		if (!JNEXT.require(self.JPLAYER_LIB_NAME)) {
			console.error("Unable to load \"" + self.JPLAYER_LIB_NAME + "\". jPlayer is unavailable.");
			return false;
		}
		
		m_strObjId = JNEXT.createObject(self.JPLAYER_OBJ_NAME);
		if (self.m_strObjId == "")  {
			console.error("JNext could not create the native jPlayer object \"" + self.JPLAYER_OBJ_NAME + "\". jPlayer is unavailable.");
			return false;
		}
		
		JNEXT.registerEvents(self);
	};

	/**
	 * Unregisters the jPlayer instance event handlers, usually done in preparation for destruction.
	 */
	self.unregisterEvents = function() {
		JNEXT.unregisterEvents(self);
	};
	
	/**
	 * Utility function to parse the result string of a JNEXT.invoke call and determine whether the call was
	 * successful.
	 * @param {String} result The result string of the JNEXT.invoke call.
	 * @returns {Boolean} Returns True if the result of the JNEXT.invoke call indicates success, False if not.
	 */
	var parseInvokeResult = function(result) {
		console.log('jPlayer.js::parseInvokeResult', result);
		var status = result.indexOf(' ') !== -1 ? result.substring(0, result.indexOf(' ')) : result,
			success = false;
				
		if(status === self.JPLAYER_INVOKE_SUCCESS) {
			success = true;
		} else if (status === self.JPLAYER_INVOKE_ERROR) {
			// Get the error message if one exists
			var error = '';
			if(result.length > status.length + 1) {
				error = result.substr(status.length + 1);
			}
			console.error('jPlayer.js::invoke - Error: "' + error + '"');
		} else {
			console.error('jPlayer.js::invoke - Unrecognized result: "' + status + '"');
		}
		
		return success;
	};
	
	/**
	 * Utility function which wraps common JNEXT.invoke calls which consist of only the method name and a single
	 * paramter object.
	 * @param {String} method The jPlayer plugin method name.
	 * @param {Object} [params=Object] The parameters object.
	 * @returns {Boolean} Returns True if the result of the JNEXT.invoke call indicates success, False if not.
	 * @private
	 */
	var invoke = function(method, params) {
		console.log('jPlayer.js::invoke', method, params);
		return parseInvokeResult(JNEXT.invoke(m_strObjId, method, JSON.stringify(params || {})));
	};
	
	/**
	 * Debug method used to trigger events to be fired from the jPlayer plugin with the specified data.
	 * @param {String} name The event to fire.
	 * @param {Object} [data] The data to return in the event.
	 * @returns {Boolean} Returns True if the result of the JNEXT.invoke call indicates success, False if not.
	 */
	self.invokeDummyEvent = function(name, data) {
		return parseInvokeResult(JNEXT.invoke(m_strObjId, 'invokeDummyEvent', name + ' ' + JSON.stringify(data || {})));
	};
	
	/**
	 * Opens the specified mm_player player name. If the player does not exist it will automatically be created.
	 * @param {String} playerName The mm_player player name to open.
	 * @returns {Boolean} True if the player was opened successfully, False if not.
	 */
	self.open = function(playerName) {
		return invoke('open', { playerName: playerName });
	};

	/**
	 * Closes the specified mm_player player name. 
	 * @param {String} playerName The mm_player player name to close.
	 * @returns {Boolean} True if the player was closed successfully, False if not.
	 */
	self.close = function(playerName) {
		return invoke('close', { playerName: playerName });
	};
	
	/**
	 * Retrieves a list of media sources. The result of the operation is returned asynchronously
	 * in a mediaSourcesResult event.
	 * @param {String} id The ID associated with this request. The request ID will be returned
	 * in the mediaSourceResult event data so the response can be matched up with the request.
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.getMediaSources = function(id) {
		return invoke('getMediaSources', { id: id });
	};

	/**	
	 * Browse a media source for media. The result of the operation is returned asynchronously
	 * in a browseResult event.
	 * @param {String} id The ID associated with this request. The request ID will be returned
	 * in the browseResult event data so the response can be matched up with the request.
	 * @param {Number} mediaSourceId The media source ID. 
	 * @param {String} mediaNodeId The media node ID.
	 * @param {Number} limit The maximum number of media nodes to return in the browseResult event.
	 * @param {Number} offset The offset at which to start retrieving media nodes.
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.browse = function(id, mediaSourceId, mediaNodeId, limit, offset) {
		return invoke('browse', {
			id: id,
			mediaSourceId: mediaSourceId,
			mediaNodeId: mediaNodeId,
			limit: limit,
			offset: offset
		});
	};
	
	/**
	 * Search for media items in a specific media source. The result of the operation is returned asynchronously
	 * in the searchResult event.
	 * @param {String} id A unique identifier for the request
	 * @param {Integer} mediaSourceId The ID of the media source.
	 * @param {String} searchTerm The term to search for.
	 * @param {String} filter Used to filter the search results
	 * @param {Number} limit The maximum number of media nodes to retrieve. A limit of -1 indicates no limit.
	 * @param {Number} offset The offset at which to start retrieving media nodes. An offset of 0 indicates no offset.
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.search = function(id, mediaSourceId, searchTerm, filter, limit, offset) {
		return invoke('search', {
			id: id,
			mediaSourceId: mediaSourceId,
			searchTerm: searchTerm,
			filter: filter,
			limit: limit,
			offset: offset
		});
	};

	/**
	 * Retrieves the currently playing track information. The result of the request is returned asynchronously in the
	 * currentTrackInfoResult event.
	 * @param {String} id The unique identifier for the request.
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.getCurrentTrackInfo = function(id) {
		return invoke('getCurrentTrackInfo', { id: id });
	};

	/**
	 * Retrieves the current playback position, in milliseconds, of the current track. The result of the request is
	 * returned ascynrhonously in the currentTrackPositionResult event.
	 * @param {String} id The unique identifier for the request.
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.getCurrentTrackPosition = function(id) {
		return invoke('getCurrentTrackPosition', { id: id });
	};

	/**
	 * Retrieves metadata for the given MediaNode ID. The result is returned asynchronously via the metadataResult
	 * event.
	 * @param {String} id The unique identifier for the request.
	 * @param {Number} mediaSourceId The MediaNode's media source ID.
	 * @param {String} mediaNodeId The MediaNode ID.
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.getMetadata = function(id, mediaSourceId, mediaNodeId) {
		return invoke('getMetadata', {
			id: id,
			mediaSourceId: mediaSourceId,
			mediaNodeId: mediaNodeId
		});
	};
	
	/**
	 * Retrieves extended metadata for the given MediaNode ID. The result is returned asynchronously via the
	 * extendedMetadataResult event.
	 * @param {String} id The unique identifier for the request.
	 * @param {Number} mediaSourceId The MediaNode's media source ID.
	 * @param {String} mediaNodeId The MediaNode ID.
	 * @param {String[]} properties The array of property names to retrieve.
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.getExtendedMetadata = function(id, mediaSourceId, mediaNodeId, properties) {
		return invoke('getExtendedMetadata', {
			id: id,
			mediaSourceId: mediaSourceId,
			mediaNodeId: mediaNodeId,
			properties: properties
		});
	};
	
	/**	
	 * Creates a track session based on the given MediaNode ID. The result of this operation, the new track session's
	 * ID, is returned asynchronously in the createTrackSessionResult event, however, this operation would also result
	 * in a trackSessionChange event to occur. The order of these events are undefined, so care must be taken to ensure
	 * the client is not operating on stale data.
	 * @param {String} id The ID associated with this request.
	 * @param {Number} mediaSourceId The media source ID. 
	 * @param {String} mediaNodeId The media node ID on which to base the track session.
	 * @param {Number} index The index of the item within the track session to set as current after creation.
	 * @param {Number} limit The maximum number of media nodes to add to the track session. A limit of -1 indicates no limit.
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.createTrackSession = function(id, mediaSourceId, mediaNodeId, index, limit) {
		return invoke('createTrackSession', {
			id: id,
			mediaSourceId: mediaSourceId,
			mediaNodeId: mediaNodeId,
			index: index,
			limit: limit
		});
	};

	/**	
	 * Destroys an existing track session.
	 * @param {Number} trackSessionId The track session ID.
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.destroyTrackSession = function(trackSessionId) {
		return invoke('destroyTrackSession', { trackSessionId: trackSessionId });
	};
	
	/**
	 * Retrieves information about the current track session. The result is returned asynchronously in the
	 * currentTrackSessionInfoResult event.
	 * @param {String} id A unique identifier for the request
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.getCurrentTrackSessionInfo = function(id) {
		return invoke('getCurrentTrackSessionInfo', { id: id });
	};
	
	/**	
	 * Retrieves MediaNodes from the specified track session. The result of the operation is returned asynchronously
	 * in a trackSessionItemsResult event.
	 * @param {String} id The ID associated with this request.
	 * @param {Number} trackSessionId The track session ID.
	 * @param {Number} limit The maximum number of media nodes to retrieve. A limit of -1 indicates no limit.
	 * @param {Number} offset The offset within the track session at which to start retrieving media nodes. Optional.
	 * An offset of 0 indicates no offset.
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.getTrackSessionItems = function(id, trackSessionId, limit, offset) {
		return invoke('getTrackSessionItems', {
			id: id,
			trackSessionId: trackSessionId,
			limit: limit,
			offset: offset
		});
	};

	/**	
	 * Skips to the specified track index in the current track session. If the track index is valid, and not equal
	 * to the current track index, this would result in a trackChange event.
	 * @param {Number} index The track index.
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.jump = function(index) {
		return invoke('jump', { index: index });
	};

	/**
	 * Returns the state of the media player. The result of the operation is returned asynchronously in the
	 * playerStateResult event.
	 * @param {String} id A unique identifier for the request
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.getPlayerState = function(id) {
		return invoke('getPlayerState', { id: id });
	};
	
	/**
	 * Start or resume playback of the current track session.
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.play = function() {
		return invoke('play');
	};
	
	/**
	 * Pause playback.
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.pause = function() {
		return invoke('pause');
	};
	
	/**
	 * Stop playback.
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.stop = function() {
		return invoke('stop');
	};
	
	/**
	 * Skip to the next track in the active track session.
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.next = function() {
		return invoke('next');
	};

	/**
	 * Skip to the previous track in the active track session.
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.previous = function() {
		return invoke('previous');
	};

	/**
	 * Seek to a specific position in the active track in the active track session.
	 * @param {Number} position The track offset in ms.
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.seek = function(position) {
		return invoke('seek', { position: position });
	};
	
	/**
	 * Set the playback rate of the media player.
	 * @param {Number} playbackRate A value of 1.0 is regular play speed. Negative numbers result in reverse playback.
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.setPlaybackRate = function(playbackRate) {
		return invoke('setPlaybackRate', { playbackRate: playbackRate });
	};

	/**
	 * Set the shuffle mode for the active track session.
	 * @param {Number} shuffleMode The shuffle mode.
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.shuffle = function(shuffleMode) {
		return invoke('shuffle', { shuffleMode: shuffleMode });
	};

	/**
	 * Set the repeat mode for the active track session.
	 * @param {Number} repeatMode The repeat mode.
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.repeat = function(repeatMode) {
		return invoke('repeat', { repeatMode: repeatMode });
	};
	/**
	 * Set the debug verbosity for jPlayer
	 * @param {Number} verbosity The verbosity level
	 * @returns {Boolean} True if the call was successful, False if not.
	 */
	self.setDebugVerbosity = function(verbosity) {
		return invoke('setDebugVerbosity', { verbosity: verbosity });
	};
	/**
	 * JNEXT interface method responsible for routing plugin events.
	 * @param {String} strData The event data. The first chunk of the string, delimited by a space,
	 * is the event name, while the data following that (if any) is the event data.
	 */
	self.onEvent = function(strData) {
		console.log('jPlayer.js::onEvent', strData);
		// Parse out the event name
		var name = strData.indexOf(' ') !== -1 ? strData.substring(0, strData.indexOf(' ')) : strData,
			data = null,
			handler = null;

		// Get the event data
		try {
			if(strData.length > name.length + 1) {
				data = JSON.parse(strData.substr(name.length + 1));
			}
		} catch(ex) {
			console.error('jPlayer.js::onEvent - Unable to parse event data as JSON');
		}
		
		// Determine the handler
		switch(name) {
			// Asynchronous events
			case 'mediaSourceChange':	handler = self.onMediaSourceChange;		break;
			case 'trackSessionChange':	handler = self.onTrackSessionChange;	break;
			case 'playerStateChange':	handler = self.onPlayerStateChange;		break;
			case 'trackChange':			handler = self.onTrackChange;			break;
			case 'trackPositionChange':	handler = self.onTrackPositionChange;	break;
			case 'error':				handler = self.onError;					break;
			
			// Result events
			case 'mediaSourcesResult':				handler = self.onMediaSourcesResult;			break;
			case 'browseResult':					handler = self.onBrowseResult;					break;
			case 'currentTrackInfoResult':			handler = self.onCurrentTrackInfoResult;		break;
			case 'currentTrackPositionResult':		handler = self.onCurrentTrackPositionResult;	break;
			case 'metadataResult':					handler = self.onMetadataResult;				break;
			case 'extendedMetadataResult':			handler = self.onExtendedMetadataResult;		break;
			case 'createTrackSessionResult':		handler = self.onCreateTrackSessionResult;		break;
			case 'currentTrackSessionInfoResult':	handler = self.onCurrentTrackSessionInfoResult;	break;
			case 'trackSessionItemsResult':			handler = self.onTrackSessionItemsResult;		break;
			case 'searchResult':					handler = self.onSearchResult;					break;
			case 'playerStateResult':				handler = self.onPlayerStateResult;				break;
			default:
				console.error('jPlayer.js::onEvent - Unrecognized event name: "' + name + '"');
		}
		
		// Call the handler for the event
		if(handler) {
			handler(data);
		}
	};

	/* Asynchronous events */
	
	/**
	 * mediaSourceChange event callback.
	 */
	self.onMediaSourceChange = null;
	
	/**
	 * trackSessionChange event callback.
	 */
	self.onTrackSessionChange = null;
	
	/**
	 * onPlayerStateChange event callback.
	 */
	self.onPlayerStateChange = null;
	
	/**
	 * trackChange event callback.
	 */
	self.onTrackChange = null;
	
	/**
	 * trackPositionChange event callback.
	 */
	self.onTrackPositionChange = null;
	
	/**
	 * error event callback.
	 */
	self.onError = null;

	/* Result events */
	
	/**
	 * mediaSourcesResult event callback.
	 */
	self.onMediaSourcesResult = null;
	
	/**
	 * browseResult event callback.
	 */
	self.onBrowseResult = null;
	
	/**
	 * currentTrackInfoResult event callback.
	 */
	self.onCurrentTrackInfoResult = null;
	
	/**
	 * currentTrackPositionResult event callback.
	 */
	self.onCurrentTrackPositionResult = null;
	
	/**
	 * onMetadataResult event callback.
	 */
	self.onMetadataResult = null;
	
	/**
	 * onExtendedMetadataResult event callback.
	 */
	self.onExtendedMetadataResult = null;
	
	/**
	 * onCreateTrackSessionResult event callback.
	 */
	self.onCreateTrackSessionResult = null;
	
	/**
	 * onCurrentTrackSessionInfoResult event callback.
	 */
	self.onCurrentTrackSessionInfoResult = null;
	
	/**
	 * onTrackSessionItemsResult event callback.
	 */
	self.onTrackSessionItemsResult = null;
	
	/**
	 * searchResult event callback.
	 */
	self.onSearchResult = null;
	
	/**
	 * playerStateResult event callback.
	 */
	self.onPlayerStateResult = null;
	
	
	// Initialize the jPlayer instance
	init();
	
	// Return the instance
	return self;
};

if(typeof module === 'object') {
	module.exports = { createObject : function () { return new JNEXT.JPLAYER_(); } };
} else {
	window.JNEXT.JPLAYER = new JNEXT.JPLAYER_();
}
