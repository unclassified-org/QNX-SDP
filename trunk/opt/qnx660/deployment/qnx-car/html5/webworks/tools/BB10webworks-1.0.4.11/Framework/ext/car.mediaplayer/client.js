/**
 * @module car_xyz_mediaplayer
 * @description Provides media playback, browse, and search
 */
 
/*
 * @author lgreenway
 * $Id: client.js 7381 2013-10-23 14:59:41Z nschultz@qnx.com $
 */

var _ID = require("./manifest.json").namespace,
	_callback = require('lib/callback'),
	Event = require('./enum/Event'),
	MediaNodeType = require('./enum/MediaNodeType'),
	PlayerStatus = require('./enum/PlayerStatus'),
	MediaSourceEvent = require('./enum/MediaSourceEvent'),
	MediaSourceType = require('./enum/MediaSourceType'),
	TrackSessionEvent = require('./enum/TrackSessionEvent'),
	RepeatMode = require('./enum/RepeatMode'),
	ShuffleMode = require('./enum/ShuffleMode');

/**
 * @description <p>The <b>car.mediaplayer</b> MediaPlayer instance contstructor function
 * <p>Open the specified player and return an instance of the MediaPlayer object,
 * which is used to perform actions on the media player and to receive update events
 * through watchers.
 * @name MediaPlayer
 * @param {String} playerName The name of the player to open. If the player does not exist, it is automatically created.
 * @returns {MediaPlayer} The <b>car.mediaplayer.MediaPlayer</b> instance.
 * @memberOf module:car_xyz_mediaplayer
 * @constructor
 * @example
 *
 * // Instantiate a media player object, specifying the player name
 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
 *
 *
 *
 * @example REST
 *
 * Request:
 * http://&lt;car-ip&gt;/car.mediaplayer/open?playerName=playerName
 *
 * Success Response:
 * {
 *		"code": 1,
 *		"data": true
 * }
 *
 * Error Response:
 * {
 *		code: -1,
 *		msg: "An error has occurred"
 * }
 */
var MediaPlayer = function(playerName) {
	/**
	 * Reference to this object instance.
	 * @private
	 */
	var self = this;
	
	/**
	 * Opens the specified player name.
	 * @param {String} name The player name to open. If the player does not exist it will automatically be created.
	 * @returns {Boolean} True if the player was opened successfully, False if not.
	 * @private
	 */
	var open = function(playerName) {
		console.log('car.mediaplayer/client.js::open', playerName);
		return window.webworks.execSync(_ID, 'open', { playerName: playerName });
	};
	
	/**
	 * Closes the specified player name.
	 * @param {String} name The player name to close.
	 * @returns {Boolean} True if the player was closed successfully, False if not.
	 * @private
	 */
	var close = function(playerName) {
		console.log('car.mediaplayer/client.js::close', playerName);
		return window.webworks.execSync(_ID, 'close', { playerName: playerName });
	};

	/**
	 * Return the list of available media sources connected to the device
	 *
	 * @param {Function} success The function to call on success.
	 * @param {Function} [error] The function to call on error.
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method getMediaSources	 
	 * @example
	 * // Define your callback function(s)
	 * function successCallback(mediaSources) {
	 * 	// Iterate through all of the media sources
	 * 	for (var i=0; i&lt;mediaSources.length; i++) {
	 * 		console.log("media source id = " + mediaSources[i].id + "\n" +
	 * 					"media source uid = " + mediaSources[i].uid + "\n" +
	 * 					"media source name = " + mediaSources[i].name + "\n" +
	 * 					"media source type = " + mediaSources[i].type + "\n" +
	 * 					"media source ready = " + mediaSources[i].ready);
	 * 		console.group("media source capabilities");
	 * 		console.log("play = " + mediaSources[i].capabilities.play + "\n" +
	 * 					"pause = " + mediaSources[i].capabilities.pause + "\n" +
	 * 					"stop = " + mediaSources[i].capabilities.stop + "\n" +
	 * 					"next = " + mediaSources[i].capabilities.next + "\n" +
	 * 					"previous = " + mediaSources[i].capabilities.previous + "\n" +
	 * 					"seek = " + mediaSources[i].capabilities.seek + "\n" +
	 * 					"shuffle = " + mediaSources[i].capabilities.shuffle + "\n" +
	 * 					"repeatOne = " + mediaSources[i].capabilities.repeatOne + "\n" +
	 * 					"repeatAll = " + mediaSources[i].capabilities.repeatAll + "\n" +
	 * 					"metadata = " + mediaSources[i].capabilities.metadata + "\n" +
	 * 					"search = " + mediaSources[i].capabilities.search + "\n" +
	 * 					"playbackRate = " + mediaSources[i].capabilities.playbackRate);
	 * 		console.groupEnd();
	 * 	}
	 * }
	 * 
	 * function errorCallback(error) {
	 *		console.log(error.code, error.msg);
	 * }
	 *
	 * //call the method
	 * car.mediaplayer.getMediaSources(successCallback, errorCallback);
	 *
	 *
	 *
	 * @example REST
	 *
	 * Request:
	 * http://&lt;car-ip&gt;/car.mediaplayer/getMediaSources
	 *
	 * Success Response:
	 * {
	 *		code: 1,
	 *		data: [
	 *			{
	 *				id: 0,
	 *				uid: "dbmme",
	 *				name: "Juke Box",
	 *				type: 1,
	 *				capabilities: {
	 *					play: true,
	 *					pause: true,
	 *					stop: true,
	 *					next: true,
	 *					previous: true,
	 *					seek: true,
	 *					shuffle: true,
	 *					repeatOne: true,
	 *					repeatAll: true,
	 *					metadata: true,
	 *					search: true,
	 *					playbackRate: true
	 *				}
	 *			}, {
	 *				id: 1,
	 *				uid: "0",
	 *				name: "Bluetooth Phone",
	 *				type: 4096,
	 *				capabilities: {
	 *					play: true,
	 *					pause: true,
	 *					stop: true,
	 *					next: false,
	 *					previous: false,
	 *					seek: false,
	 *					shuffle: false,
	 *					repeatOne: false,
	 *					repeatAll: false,
	 *					metadata: true,
	 *					search: false,
	 *					playbackRate: false
	 *				}
	 *			}
	 *		]
	 * }
	 *
	 * Error Response:
	 * {
	 *		code: -1,
	 *		msg: "An error has occurred"
	 * }
	 */
	self.getMediaSources = function(success, error) {
		console.log('car.mediaplayer/client.js::getMediaSources');
		window.webworks.exec(success, error, _ID, 'getMediaSources', null, false);
	};
	
	/**
	 * Browse a media source for media
	 * @param {Number} mediaSourceId The ID of the media source to be retrieved.
	 * @param {Function} success The function to call on success.
	 * @param {Function} [error] The function to call on error.
	 * @param {String} [mediaNodeId=null] The ID of the media node to browse. If omitted or null, the root node
	 * is retrieved.
	 * @param {Number} [limit=-1] The maximum number of records to retrieve. If omitted or negative,
	 * all records are retrieved.
	 * @param {Number} [offset=0] The offset at which to start retrieving records. If omitted or negative,
	 * the offset is 0.
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method browse
	 * @example
	 *
	 * // Define your callback function(s)
	 * function successCallback(mediaNodes) {
	 * 	// Iterate through all of the node results
	 * 	for (var i=0; i&lt;mediaNodes.length; i++) {
	 * 		console.log("media node id = " + mediaNodes[i].id + "\n" +
	 * 					"media node name = " + mediaNodes[i].name + "\n" +
	 * 					"media node url = " + mediaNodes[i].url + "\n" +
	 * 					"media node type = " + mediaNodes[i].type + "\n" +
	 * 					"media node count = " + mediaNodes[i].count + "\n");
	 * 	}
	 * }
	 * 
	 * function errorCallback(error) {
	 * 	console.log(error.code, error.msg);
	 * }
	 * 
	 * // Instantiate a media player object, specifying the player name
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Browse the media source from its root
	 * mediaPlayer.browse(0, successCallback, errorCallback, null, 10, 0);
	 *
	 *
	 *
	 * @example REST
	 *
	 * Request:
	 * http://&lt;car-ip&gt;/car.mediaplayer/browse?mediaSourceId=0&limit=10&offset=0
	 *
	 * Success Response:
	 * {
	 *		code: 1,
	 *		data: [
	 *		{
	 *			"id": "/artists-2",
	 *			"name": "Artists",
	 *			"url": null,
	 *			"type": 1,
	 *			"count": -1
	 *		},
	 *		{
	 *			"id": "/albums-5",
	 *			"name": "Albums",
	 *			"url": null,
	 *			"type": 1,
	 *			"count": -1
	 *		},
	 *		{
	 *			"id": "/genres-8",
	 *			"name": "Genres",
	 *			"url": null,
	 *			"type": 1,
	 *			"count": -1
	 *		},
	 *		{
	 *			"id": "/songs-7",
	 *			"name": "Songs",
	 *			"url": null,
	 *			"type": 1,
	 *			"count": -1
	 *		},
	 *		{
	 *			"id": "/videos-10",
	 *			"name": "Videos",
	 *			"url": null,
	 *			"type": 1,
	 *			"count": -1
	 *		}
	 *	]
	 * }
	 *
	 * Error Response:
	 * {
	 *		code: -1,
	 *		msg: "An error has occurred"
	 * }
	 */
	self.browse = function(mediaSourceId, success, error, mediaNodeId, limit, offset) {
		console.log('car.mediaplayer/client.js::browse', mediaSourceId, mediaNodeId, limit, offset);
		var args = {
				mediaSourceId: mediaSourceId,
				mediaNodeId: typeof mediaNodeId === 'string' && mediaNodeId.trim() !== '' ? mediaNodeId : null,
				limit: typeof limit === 'number' ? limit : -1,
				offset: typeof offset === 'number' ? offset : 0
		};
		window.webworks.exec(success, error, _ID, 'browse', args, false);
	};
	
	/**
	 * Search for media in a specific media source
	 * @param {Number} mediaSourceId The ID of the media source.
	 * @param {String} searchTerm The term to search for.
	 * @param {Function} success The function to call on success.
	 * @param {Function} [error] The function to call on error.
	 * @param {String} [filter=null] The filter to use to search.
	 * null, the search starts from the root node.
	 * @param {Number} [limit=-1] The maximum number of records to retrieve. If omitted or negative,
	 * all records are retrieved.
	 * @param {Number} [offset=0] The offset at which to start retrieving records. If omitted or negative,
	 * the offset is 0.
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method search 
	 * @example
	 *
	 * // Define your callback function(s)
	 * function successCallback(mediaNodes) {
	 * 	// Iterate through all of the node results
	 * 	for (var i=0; i&lt;mediaNodes.length; i++) {
	 * 		console.log("media node id = " + mediaNodes[i].id + "\n" +
	 * 					"media node name = " + mediaNodes[i].name + "\n" +
	 * 					"media node url = " + mediaNodes[i].url + "\n" +
	 * 					"media node type = " + mediaNodes[i].type + "\n" +
	 * 					"media node count = " + mediaNodes[i].count + "\n");
	 * 	}
	 * }
	 * 
	 * function errorCallback(error) {
	 * 	console.log(error.code, error.msg);
	 * }
	 * 
	 * // Instantiate a media player object, specifying the player name
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Search the media source from its root
	 * mediaPlayer.search(0, 'ong', successCallback, errorCallback, null, 10, 0);
	 *
	 *
	 *
	 * @example REST
	 *
	 * Request:
	 * http://&lt;car-ip&gt;/car.mediaplayer/search?mediaSourceId=0&searchTerm=ong&limit=10&offset=0
	 *
	 * Success Response:
	 * {
	 * 	"code": 1,
	 * 	"data": [
	 * 		{
	 * 			"id": "/artists/11-3",
	 * 			"name": "AllisonGray",
	 * 			"url": null,
	 * 			"type": 1,
	 * 			"count": 1
	 * 		},
	 * 		{
	 * 			"id": "/songs/15",
	 * 			"name": "Sarasong",
	 * 			"url": "file:///accounts/1000/shared/music/Sarasong.mp3",
	 * 			"type": 2,
	 * 			"count": -1
	 * 		}
	 * 	]
	 * }
	 *
	 * Error Response:
	 * {
	 *		code: -1,
	 *		msg: "An error has occurred"
	 * }
	 */
	self.search = function(mediaSourceId, searchTerm, success, error, filter, limit, offset) {
		console.log('car.mediaplayer/client.js::search', arguments);
		var args = {
				mediaSourceId: mediaSourceId,
				searchTerm: searchTerm,
				filter: typeof filter === 'string' && filter.trim() !== '' ? filter : null,
				limit: typeof limit === 'number' ? limit : -1,
				offset: typeof offset === 'number' ? offset : 0
		};
		window.webworks.exec(success, error, _ID, 'search', args, false);
	};
	
	/**
	 * Create a new tracksession
	 * @param {Number} mediaSourceId The ID of the media source.
	 * @param {Function} success The function to call on success.
	 * @param {Function} [error] The function to call on error.
	 * @param {?String} [mediaNodeId=null] The media node ID on which to base the tracksession.
	 * @param {Number} [index=0] The index of the item within the tracksession to set as current after creating
	 * the tracksession.
	 * @param {Number} [limit=-1] The maximum number of media nodes to add to the tracksession. A limit of -1
	 * indicates no limit.
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method createTrackSession	 
	 * @example
	 *
	 * // Define your callback function(s)
	 * function successCallback(result) {
	 * 	console.log("tracksession id = " + result.trackSessionId + "\n");
	 * 	
	 * 	// Play the new tracksession
	 * 	mediaPlayer.play();
	 * }
	 * 
	 * function errorCallback(error) {
	 * 	console.log(error.code, error.msg);
	 * }
	 * 
	 * // Instantiate a media player object, specifying the player name
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Create a tracksession from a folder node ID, setting the third track as first to play
	 * mediaPlayer.createTrackSession(0, successCallback, errorCallback, '/songs-7', 2);
	 *
	 *
	 *
	 * @example REST
	 *
	 * Request:
	 * http://&lt;car-ip&gt;/car.mediaplayer/createTrackSession?mediaSourceId=0&mediaNodeId=/songs-7&index=2
	 *
	 * Success Response:
	 * {
	 * 	"code": 1,
	 * 	"data": {
	 * 		"trackSessionId": 10
	 * 	}
	 * }
	 *
	 * Error Response:
	 * {
	 *		code: -1,
	 *		msg: "An error has occurred"
	 * }
	 */
	self.createTrackSession = function(mediaSourceId, success, error, mediaNodeId, index, limit) {
		console.log('car.mediaplayer/client.js::createTrackSession', arguments);
		var args = {
				mediaSourceId: mediaSourceId,
				mediaNodeId: mediaNodeId,
				index: index,
				limit: limit,
		};
		window.webworks.exec(success, error, _ID, 'createTrackSession', args, false);
	};
	
	/**
	 * Destroy an existing tracksession
	 * @param {Number} trackSessionId The ID of the tracksession to destroy.
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method destroyTrackSession	 
	 * @example
	 *
	 * // Instantiate a media player object, specifying the player name
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Destroy the tracksession by its ID
	 * mediaPlayer.destroyTrackSession(10);
	 *
	 *
	 *
	 * @example REST
	 *
	 * Request:
	 * http://&lt;car-ip&gt;/car.mediaplayer/destroyTrackSession?trackSessionId=10
	 *
	 * Success Response:
	 * {
	 * 	"code": 1
	 * }
	 *
	 * Error Response:
	 * {
	 *		code: -1,
	 *		msg: "An error has occurred"
	 * }
	 */
	self.destroyTrackSession = function(trackSessionId) {
		console.log('car.mediaplayer/client.js::destroyTrackSession', trackSessionId);
		var args = { trackSessionId: trackSessionId };
		window.webworks.execAsync(_ID, 'destroyTrackSession', args);
	};
	
	/**
	 * Retrieve the current tracksession information
	 * @param {Function} success The function to call on success.
	 * @param {Function} [error] The function to call on error.
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method getTrackSessionInfo
	 * @example
	 *
	 * // Define your callback function(s)
	 * function successCallback(result) {
	 * 	console.log("tracksession id = " + result.trackSessionId + "\n" +
	 * 				"tracksession length = " + result.length);
	 * }
	 * 
	 * function errorCallback(error) {
	 * 	console.log(error.code, error.msg);
	 * }
	 * 
	 * // Instantiate a media player object, specifying the player name
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Get the current tracksession info
	 * mediaPlayer.getTrackSessionInfo(successCallback, errorCallback);
	 *
	 *
	 *
	 * @example REST
	 *
	 * Request:
	 * http://&lt;car-ip&gt;/car.mediaplayer/getTrackSessionInfo
	 *
	 * Success Response:
	 * {
	 * 	"code": 1,
	 * 	"data": {
	 * 		"trackSessionId": 10,
	 * 		"length": 17
	 * 	}
	 * }
	 *
	 * Error Response:
	 * {
	 *		code: -1,
	 *		msg: "An error has occurred"
	 * }
	 */
	self.getTrackSessionInfo = function(success, error) {
		console.log('car.mediaplayer/client.js::getTrackSessionInfo');
		window.webworks.exec(success, error, _ID, 'getTrackSessionInfo', null, false);
	};
	
	/**
	 * Retrieve media from the current tracksession
	 * @param {Function} success The function to call on success.
	 * @param {Function} [error] The function to call on error.
	 * @param {Number} [limit=-1] The maximum number of records to retrieve. If omitted or negative,
	 * all records are retrieved.
	 * @param {Number} [offset=0] The offset at which to start retrieving records. If omitted or negative,
	 * the offset is 0.
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method getTrackSessionItems	 
	 * @example
	 *
	 * function successCallback(mediaNodes) {
	 * 	// iterate through all of the node results
	 * 	for (var i=0; i&lt;mediaNodes.length; i++) {
	 * 		console.log("media node id = " + mediaNodes[i].id + "\n" +
	 * 					"media node name = " + mediaNodes[i].name + "\n" +
	 * 					"media node url = " + mediaNodes[i].url + "\n" +
	 * 					"media node type = " + mediaNodes[i].type + "\n" +
	 * 					"media node count = " + mediaNodes[i].count + "\n");
	 * 	}
	 * }
	 * 
	 * function errorCallback(error) {
	 * 	console.log(error.code, error.msg);
	 * }
	 * 
	 * // Instantiate a media player object, specifying the player name
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Get the third through fifth tracksession items
	 * mediaPlayer.getTrackSessionItems(successCallback, errorCallback, 3, 2);
	 *
	 *
	 *
	 * @example REST
	 *
	 * Request:
	 * http://&lt;car-ip&gt;/car.mediaplayer/getTrackSessionItems?limit=3&offset=2
	 *
	 * Success Response:
	 * {
	 * 	"code": 1,
	 * 	"data": [
	 * 		{
	 * 			"id": "/songs/3",
	 * 			"name": "Funktional Love ft. Ruchama",
	 * 			"url": "file:///accounts/1000/shared/music/Funktional Love ft. Ruchama.mp3",
	 * 			"type": 2,
	 * 			"count": -1
	 * 		},
	 * 		{
	 * 			"id": "/songs/4",
	 * 			"name": "Hero",
	 * 			"url": "file:///accounts/1000/shared/music/Hero.mp3",
	 * 			"type": 2,
	 * 			"count": -1
	 * 		},
	 * 		{
	 * 			"id": "/songs/6",
	 * 			"name": "In Her Smile",
	 * 			"url": "file:///accounts/1000/shared/music/In Her Smile.mp3",
	 * 			"type": 2,
	 * 			"count": -1
	 * 		}
	 * 	]
	 * }
	 *
	 * Error Response:
	 * {
	 *		code: -1,
	 *		msg: "An error has occurred"
	 * }
	 */
	self.getTrackSessionItems = function(success, error, limit, offset) {
		console.log('car.mediaplayer/client.js::getTrackSessionItems', limit, offset);
		var args = {
				limit: typeof limit === 'number' ? limit : -1,
				offset: typeof offset === 'number' ? offset : 0
		};
		window.webworks.exec(success, error, _ID, 'getTrackSessionItems', args, false);
	};

	/**
	 * Retrieve information for the currently playing track 
	 * @param {Function} success The function to call on success.
	 * @param {Function} [error] The function to call on error.
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer	 
	 * @method getCurrentTrack
	 * @example
	 *
	 * function successCallback(trackInfo) {
	 * 	console.log("track info media source ID = " + trackInfo.mediaSourceId + "\n" +
	 * 				"track info tracksession index = " + trackInfo.index);
	 * 
	 * 	console.group("track info media node");
	 * 	console.log("id = " + trackInfo.mediaNode.id + "\n" +
	 * 				"name = " + trackInfo.mediaNode.name + "\n" +
	 * 				"url = " + trackInfo.mediaNode.url + "\n" +
	 * 				"type = " + trackInfo.mediaNode.type + "\n" +
	 * 				"count = " + trackInfo.mediaNode.count + "\n");
	 * 	console.groupEnd();
	 * 
	 * 	console.group("track info metadata");
	 * 	console.log("title = " + trackInfo.metadata.title + "\n" +
	 * 				"duration = " + trackInfo.metadata.duration + "\n" +
	 * 				"artwork = " + trackInfo.metadata.artwork + "\n" +
	 * 				"artist = " + trackInfo.metadata.artist + "\n" +
	 * 				"album = " + trackInfo.metadata.album + "\n" +
	 * 				"genre = " + trackInfo.metadata.genre + "\n" +
	 * 				"disc = " + trackInfo.metadata.disc + "\n" +
	 * 				"track = " + trackInfo.metadata.track + "\n" +
	 * 				"width = " + trackInfo.metadata.width + "\n" +
	 * 				"height = " + trackInfo.metadata.height);
	 * 	console.groupEnd();
	 * }
	 * 
	 * function errorCallback(error) {
	 * 	console.log(error.code, error.msg);
	 * }
	 * 
	 * // Instantiate a media player object, specifying the player name
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Get the current track information
	 * mediaPlayer.getCurrentTrack(successCallback, errorCallback);
	 *
	 *
	 *
	 * @example REST
	 *
	 * Request:
	 * http://&lt;car-ip&gt;/car.mediaplayer/getCurrentTrack
	 *
	 * Success Response:
	 * {
	 * 	"code": 1,
	 * 	"data": {
	 * 		"index": 0,
	 * 		"mediaSourceId": 0,
	 * 		"mediaNode": {
	 * 			"id": "/songs/1",
	 * 			"name": "Bo Bo's Groove",
	 * 			"url": "file:///accounts/1000/shared/music/Bo Bo's Groove.mp3",
	 * 			"type": 2,
	 * 			"count": -1
	 * 		},
	 * 		"metadata": {
	 * 			"title": "Bo Bo's Groove",
	 * 			"duration": 318411,
	 * 			"artwork": "file:///apps/mediasources/imagecache//mme/2/original",
	 * 			"artist": "tomprincipato",
	 * 			"album": "Raising The Roof!",
	 * 			"genre": "rock",
	 * 			"disc": 0,
	 * 			"track": 0,
	 * 			"width": -1,
	 * 			"height": -1
	 * 		}
	 * 	}
	 * }
	 *
	 * Error Response:
	 * {
	 *		code: -1,
	 *		msg: "An error has occurred"
	 * }
	 */
	self.getCurrentTrack = function(success, error) {
		console.log('car.mediaplayer/client.js::getCurrentTrack');
		window.webworks.exec(success, error, _ID, 'getCurrentTrack', null, false);
	};
	
	/**
	 * Retrieve the current playback position, in milliseconds, of the current track.
	 * @param {Function} success The function to call on success.
	 * @param {Function} [error] The function to call on error.
	 * @memberOf module:car_xyz_mediaplayer.Mediaplayer	 
	 * @method getCurrentTrackPosition
	 * @example
	 *
	 * function successCallback(result) {
	 * 	console.log("current track position = " + result.position);
	 * }
	 * 
	 * function errorCallback(error) {
	 * 	console.log(error.code, error.msg);
	 * }
	 * 
	 * // Instantiate a media player object, specifying the player name
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Get the current track playback position
	 * mediaPlayer.getCurrentTrackPosition(successCallback, errorCallback);
	 *
	 *
	 *
	 * @example REST
	 *
	 * Request:
	 * http://&lt;car-ip&gt;/car.mediaplayer/getCurrentTrackPosition
	 *
	 * Success Response:
	 * {
	 * 	"code": 1,
	 * 	"data": {
	 * 		"position": 12345
	 * 	}
	 * }
	 *
	 * Error Response:
	 * {
	 *		code: -1,
	 *		msg: "An error has occurred"
	 * }
	 */
	self.getCurrentTrackPosition = function(success, error) {
		console.log('car.mediaplayer/client.js::getCurrentTrackPosition');
		window.webworks.exec(success, error, _ID, 'getCurrentTrackPosition', null, false);
	};
	
	/**
	 * Retrieve metadata for the specified media
	 * @param {Number} mediaSourceId The ID of the node's media source.
	 * @param {String} mediaNodeId The ID of the media node to retrieve metadata for.
	 * @param {Function} success The function to call on success.
	 * @param {Function} [error] The function to call on error.
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer	 
	 * @method getMetadata
	 * @example
	 *
	 * function successCallback(metadata) {
	 * 	console.log("metadata title = " + metadata.title + "\n" +
	 * 				"metadata duration = " + metadata.duration + "\n" +
	 * 				"metadata artwork = " + metadata.artwork + "\n" +
	 * 				"metadata artist = " + metadata.artist + "\n" +
	 * 				"metadata album = " + metadata.album + "\n" +
	 * 				"metadata genre = " + metadata.genre + "\n" +
	 * 				"metadata disc = " + metadata.disc + "\n" +
	 * 				"metadata track = " + metadata.track + "\n" +
	 * 				"metadata width = " + metadata.width + "\n" +
	 * 				"metadata height = " + metadata.height);
	 * }
	 * 
	 * function errorCallback(error) {
	 * 	console.log(error.code, error.msg);
	 * }
	 * 
	 * // Instantiate a media player object, specifying the player name
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Get metadata for the specified node
	 * mediaPlayer.getMetadata(0, '/songs/1', successCallback, errorCallback);
	 *
	 *
	 *
	 * @example REST
	 *
	 * Request:
	 * http://&lt;car-ip&gt;/car.mediaplayer/getMetadata?mediaSourceId=0&mediaNodeId=/songs/1
	 *
	 * Success Response:
	 * {
	 * 	"code": 1,
	 * 	"data": {
	 * 		"title": "Bo Bo's Groove",
	 * 		"duration": 318411,
	 * 		"artwork": "file:///apps/mediasources/imagecache//mme/2/original",
	 * 		"artist": "tomprincipato",
	 * 		"album": "Raising The Roof!",
	 * 		"genre": "rock",
	 * 		"disc": 0,
	 * 		"track": 0,
	 * 		"width": -1,
	 * 		"height": -1
	 * 	}
	 * }
	 *
	 * Error Response:
	 * {
	 *		code: -1,
	 *		msg: "An error has occurred"
	 * }
	 */
	self.getMetadata = function(mediaSourceId, mediaNodeId, success, error) {
		console.log('car.mediaplayer/client.js::getMetadata', mediaSourceId, mediaNodeId);
		var args = {
			mediaSourceId: mediaSourceId,
			mediaNodeId: mediaNodeId
		};
		window.webworks.exec(success, error, _ID, 'getMetadata', args, false);
	};

	/**
	 * Retrieve extended metadata properties for the specified media.
	 * @param {Number} mediaSourceId The ID of the node's media source.
	 * @param {String} mediaNodeId The ID of the media node to retrieve metadata for.
	 * @param {String[]} properties An array of extended metadata property names to retrieve.
	 * @param {Function} success The function to call on success.
	 * @param {Function} [error] The function to call on error.
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer	 
	 * @method getExtendedMetadata
	 * @example
	 *
	 * function successCallback(metadata) {
	 * 	console.log("metadata composer = " + metadata.composer + "\n" +
	 * 				"metadata bpm = " + metadata.bpm);
	 * }
	 * 
	 * function errorCallback(error) {
	 * 	console.log(error.code, error.msg);
	 * }
	 * 
	 * // Instantiate a media player object, specifying the player name
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Get metadata for the specified node
	 * mediaPlayer.getExtendedMetadata(0, '/songs/1', ['composer, 'bpm'], successCallback, errorCallback);
	 *
	 *
	 *
	 * @example REST
	 *
	 * Request:
	 * http://&lt;car-ip&gt;/car.mediaplayer/getMetadata?mediaSourceId=0&mediaNodeId=/songs/1&properties=composer,bpm
	 *
	 * Success Response:
	 * {
	 * 	"code": 1,
	 * 	"data": {
	 * 		"composer": "Gregory Bonino",
	 * 		"bpm": 90
	 * 	}
	 * }
	 *
	 * Error Response:
	 * {
	 *		code: -1,
	 *		msg: "An error has occurred"
	 * }
	 */
	self.getExtendedMetadata = function(mediaSourceId, mediaNodeId, properties, success, error) {
		console.log('car.mediaplayer/client.js::getExtendedMetadata', mediaSourceId, mediaNodeId, properties);
		var args = {
			mediaSourceId: mediaSourceId,
			mediaNodeId: mediaNodeId,
			properties: properties
		};
		window.webworks.exec(success, error, _ID, 'getExtendedMetadata', args, false);
	};

	/**
	 * Return the state of the media player
	 * @param {Function} success The function to call on success.
	 * @param {Function} [error] The function to call on error.
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer	 
	 * @method getPlayerState
	 * @example
	 *
	 * function successCallback(playerState) {
	 * 	console.log("player state shuffle mode = " + playerState.shuffleMode + "\n" +
	 * 				"player state repeat mode = " + playerState.repeatMode + "\n" +
	 * 				"player state player status = " + playerState.playerStatus + "\n" +
	 * 				"player state playback rate = " + playerState.playbackRate);
	 * }
	 * 
	 * function errorCallback(error) {
	 * 	console.log(error.code, error.msg);
	 * }
	 * 
	 * // Instantiate a media player object, specifying the player name
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Get the current player state
	 * mediaPlayer.getPlayerState(successCallback, errorCallback);
	 *
	 *
	 *
	 * @example REST
	 *
	 * Request:
	 * http://&lt;car-ip&gt;/car.mediaplayer/getPlayerState
	 *
	 * Success Response:
	 * {
	 * 	"code": 1,
	 * 	"data": {
	 * 		"shuffleMode": 0,
	 * 		"repeatMode": 0,
	 * 		"playerStatus": 2,
	 * 		"playbackRate": 1
	 * 	}
	 * }
	 *
	 * Error Response:
	 * {
	 *		code: -1,
	 *		msg: "An error has occurred"
	 * }
	 */
	self.getPlayerState = function(success, error) {
		console.log('car.mediaplayer/client.js::getPlayerState');
		window.webworks.exec(success, error, _ID, 'getPlayerState', null, false);
	};
	
	/**
	 * Start or resume playback of the current tracksession
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method play	 
	 * @example
	 *
	 * // Instantiate a media player object, specifying the player name
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Play
	 * mediaPlayer.play();
	 *
	 *
	 *
	 * @example REST
	 *
	 * Request:
	 * http://&lt;car-ip&gt;/car.mediaplayer/play
	 *
	 * Success Response:
	 * {
	 * 	"code": 1
	 * }
	 *
	 * Error Response:
	 * {
	 *		code: -1,
	 *		msg: "An error has occurred"
	 * }
	 */
	self.play = function() {
		console.log('car.mediaplayer/client.js::play');
		window.webworks.execAsync(_ID, 'play');
	};
	
	/**
	 * Pause playback
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method pause	 
	 * @example
	 *
	 * // Instantiate a media player object, specifying the player name
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Pause
	 * mediaPlayer.pause();
	 *
	 *
	 *
	 * @example REST
	 *
	 * Request:
	 * http://&lt;car-ip&gt;/car.mediaplayer/pause
	 *
	 * Success Response:
	 * {
	 * 	"code": 1
	 * }
	 *
	 * Error Response:
	 * {
	 *		code: -1,
	 *		msg: "An error has occurred"
	 * }
	 */
	self.pause = function() {
		console.log('car.mediaplayer/client.js::pause');
		window.webworks.execAsync(_ID, 'pause');
	};

	/**
	 * Stop playback
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method stop	 
	 * @example
	 *
	 * // Instantiate a media player object, specifying the player name
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Stop
	 * mediaPlayer.stop();
	 *
	 *
	 *
	 * @example REST
	 *
	 * Request:
	 * http://&lt;car-ip&gt;/car.mediaplayer/stop
	 *
	 * Success Response:
	 * {
	 * 	"code": 1
	 * }
	 *
	 * Error Response:
	 * {
	 *		code: -1,
	 *		msg: "An error has occurred"
	 * }
	 */
	self.stop = function() {
		console.log('car.mediaplayer/client.js::stop');
		window.webworks.execAsync(_ID, 'stop');
	};
	
	/**
	 * Skip to the next track in the active tracksession
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method next	 
	 * @example
	 *
	 * // Instantiate a media player object, specifying the player name
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Skip to the next track
	 * mediaPlayer.next();
	 *
	 *
	 *
	 * @example REST
	 *
	 * Request:
	 * http://&lt;car-ip&gt;/car.mediaplayer/next
	 *
	 * Success Response:
	 * {
	 * 	"code": 1
	 * }
	 *
	 * Error Response:
	 * {
	 *		code: -1,
	 *		msg: "An error has occurred"
	 * }
	 */
	self.next = function() {
		console.log('car.mediaplayer/client.js::next');
		window.webworks.execAsync(_ID, 'next');
	};
	
	/**
	 * Skip to the previous track in the active tracksession
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method previous	 
	 * @example
	 *
	 * // Instantiate a media player object, specifying the player name
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Skip to the previous track
	 * mediaPlayer.previous();
	 *
	 *
	 *
	 * @example REST
	 *
	 * Request:
	 * http://&lt;car-ip&gt;/car.mediaplayer/previous
	 *
	 * Success Response:
	 * {
	 * 	"code": 1
	 * }
	 *
	 * Error Response:
	 * {
	 *		code: -1,
	 *		msg: "An error has occurred"
	 * }
	 */
	self.previous = function() {
		console.log('car.mediaplayer/client.js::previous');
		window.webworks.execAsync(_ID, 'previous');
	};
	
	/**
	 * Jump to the specified index in the current tracksession
	 * @param {Number} index The index of the track within the current tracksession.
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method jump
	 * @example
	 *
	 * // Instantiate a media player object, specifying the player name
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Jump to another track in the active tracksession
	 * mediaPlayer.jump(4);
	 *
	 *
	 *
	 * @example REST
	 *
	 * Request:
	 * http://&lt;car-ip&gt;/car.mediaplayer/jump?index=4
	 *
	 * Success Response:
	 * {
	 * 	"code": 1
	 * }
	 *
	 * Error Response:
	 * {
	 *		code: -1,
	 *		msg: "An error has occurred"
	 * }
	 */
	self.jump = function(index) {
		console.log('car.mediaplayer/client.js::jump', index);
		window.webworks.execAsync(_ID, 'jump', { index: index });
	};
	
	/**
	 * Seek to a specific position in the current track
	 * @param {Number} position The track position (in ms).
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method seek
	 * @example
	 *
	 * // Instantiate a media player object, specifying the player name
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Seek
	 * mediaPlayer.seek(20000);
	 *
	 *
	 *
	 * @example REST
	 *
	 * Request:
	 * http://&lt;car-ip&gt;/car.mediaplayer/seek?position=20000
	 *
	 * Success Response:
	 * {
	 * 	"code": 1
	 * }
	 *
	 * Error Response:
	 * {
	 *		code: -1,
	 *		msg: "An error has occurred"
	 * }
	 */
	self.seek = function(position) {
		console.log('car.mediaplayer/client.js::seek', position);
		window.webworks.execAsync(_ID, 'seek', { position: position });
	};
	
	/**
	 * Set the playback rate of the media player
	 * @param {Number} playbackRate The playback rate. A rate of 1.0 is regular play speed. Negative numbers result in
	 * reverse playback.
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method setPlaybackRate
	 * @example
	 *
	 * // Instantiate a media player object, specifying the player name
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Fast forward 1.5x
	 * mediaPlayer.setPlaybackRate(1.5);
	 *
	 *
	 *
	 * @example REST
	 *
	 * Request:
	 * http://&lt;car-ip&gt;/car.mediaplayer/setPlaybackRate?playbackRate=1.5
	 *
	 * Success Response:
	 * {
	 * 	"code": 1
	 * }
	 *
	 * Error Response:
	 * {
	 *		code: -1,
	 *		msg: "An error has occurred"
	 * }
	 */
	self.setPlaybackRate = function(playbackRate) {
		console.log('car.mediaplayer/client.js::setPlaybackRate', playbackRate);
		window.webworks.execAsync(_ID, 'setPlaybackRate', { playbackRate: playbackRate });
	};
	
	/**
	 * Set the shuffle mode for the active tracksession.
	 * @param {MediaPlayer.ShuffleMode} shuffleMode The shuffle mode. Use values from the <b>MediaPlayer.ShuffleMode</b> enumeration.
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method shuffle
	 * @example
	 *
	 * // Instantiate a media player object, specifying the player name
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Turn shuffle mode on
	 * mediaPlayer.shuffle(car.mediaplayer.ShuffleMode.SHUFFLE_ON);
	 *
	 *
	 *
	 * @example REST
	 *
	 * Request:
	 * http://&lt;car-ip&gt;/car.mediaplayer/shuffle?shuffleMode=1
	 *
	 * Success Response:
	 * {
	 * 	"code": 1
	 * }
	 *
	 * Error Response:
	 * {
	 *		code: -1,
	 *		msg: "An error has occurred"
	 * }
	 */
	self.shuffle = function(shuffleMode) {
		console.log('car.mediaplayer/client.js::shuffle', shuffleMode);
		window.webworks.execAsync(_ID, 'shuffle', { shuffleMode: shuffleMode });
	};
	
	/**
	 * Set the repeat mode for the active tracksession
	 * @param {MediaPlayer.RepeatMode} repeatMode The repeat mode. Use values from the <b>MediaPlayer.RepeatMode</b> enumeration.
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method repeat
	 * @example
	 *
	 * // Instantiate a media player object, specifying the player name
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Turn repeat one mode on
	 * mediaPlayer.repeat(car.mediaplayer.RepeatMode.REPEAT_ONE);
	 *
	 *
	 *
	 * @example REST
	 *
	 * Request:
	 * http://&lt;car-ip&gt;/car.mediaplayer/repeat?repeatMode=2
	 *
	 * Success Response:
	 * {
	 * 	"code": 1
	 * }
	 *
	 * Error Response:
	 * {
	 *		code: -1,
	 *		msg: "An error has occurred"
	 * }
	 */
	self.repeat = function(repeatMode) {
		console.log('car.mediaplayer/client.js::repeat', repeatMode);
		window.webworks.execAsync(_ID, 'repeat', { repeatMode: repeatMode });
	};

	/**
	 * Watch for changes to media sources
	 * @param {Function} callback The function to call when a change is detected.
	 * @return {Number} The watch ID.
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method watchMediaSource
	 * @example
	 * 
	 * // Define a callback function
	 * function myCallback(event) {
	 * }
	 * 
	 * // Instantiate a media player object, specifying the name of the player of which to watch
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Add the watch
	 * var watchId = mediaPlayer.watchMediaSource(myCallback);
	 */
	self.watchMediaSource = function(callback) {
		console.log('car.mediaplayer/client.js::watchMediaSource');
		return _callback.watch(Event.MEDIA_SOURCE_CHANGE, callback);
	};
	
	/**
	 * Watch for changes to tracksessions
	 * @param {Function} callback The function to call when a change is detected.
	 * @return {Number} The watch ID.
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method watchTrackSession
	 * @example
	 * 
	 * // Define a callback function
	 * function myCallback(event) {
	 * }
	 * 
	 * // Instantiate a media player object, specifying the name of the player to watch
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Add the watch
	 * var watchId = mediaPlayer.watchTrackSession(myCallback);
	 */
	self.watchTrackSession = function(callback) {
		console.log('car.mediaplayer/client.js::watchTrackSession');
		return _callback.watch(Event.TRACK_SESSION_CHANGE, callback);
	};
	
	/**
	 * Watch for changes to the media player state
	 * @param {Function} callback The function to call when a change is detected.
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method watchPlayerState
	 * @return {Number} The watch ID.
	 * @example
	 * 
	 * // Define a callback function
	 * function myCallback(event) {
	 * }
	 * 
	 * // Instantiate a media player object, specifying the name of the player to watch
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Add the watch
	 * var watchId = mediaPlayer.watchPlayerState(myCallback);
	 */
	self.watchPlayerState = function(callback) {
		console.log('car.mediaplayer/client.js::watchPlayerState');
		return _callback.watch(Event.PLAYER_STATE_CHANGE, callback);
	};
	
	/**
	 * Watch for changes to the current track
	 * @param {Function} callback The function to call when a change is detected.
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method watchTrack
	 * @return {Number} The watch ID.
	 * @example
	 * 
	 * // Define a callback function
	 * function myCallback(event) {
	 * }
	 * 
	 * // Instantiate a media player object, specifying the name of the player to watch
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Add the watch
	 * var watchId = mediaPlayer.watchTrack(myCallback);
	 */
	self.watchTrack = function(callback) {
		console.log('car.mediaplayer/client.js::watchTrack');
		return _callback.watch(Event.TRACK_CHANGE, callback);
	};
	
	/**
	 * Watch for changes to the current track's position
	 * @param {Function} callback The function to call when a change is detected.
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method watchTrackPosition
	 * @return {Number} The watch ID.
	 * @example
	 * 
	 * // Define a callback function
	 * function myCallback(event) {
	 * }
	 * 
	 * // Instantiate a media player object, specifying the name of the player to watch
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Add the watch
	 * var watchId = mediaPlayer.watchTrackPosition(myCallback);
	 */
	self.watchTrackPosition = function(callback) {
		console.log('car.mediaplayer/client.js::watchTrackPosition');
		return _callback.watch(Event.TRACK_POSITION_CHANGE, callback);
	};
	
	/**
	 * Remove a watch
	 * @param {Number} watchId The watch ID.
	 * @memberOf module:car_xyz_mediaplayer.MediaPlayer
	 * @method cancelWatch
	 * @example
	 * 
	 * // Instantiate a media player object, specifying the name of the player to watch
	 * var mediaPlayer = new car.mediaplayer.MediaPlayer('playerName');
	 * 
	 * // Add a watch
	 * var watchId = mediaPlayer.watchMediaSource(function() {});
	 * 
	 * // Cancel the watch
	 * mediaPlayer.cancelWatch(watchId);
	 */
	self.cancelWatch = function(watchId) {
		console.log('car.mediaplayer/client.js::cancelWatch', watchId);
		_callback.cancelWatch(watchId);
	};
	
	// Initialize the media player
	if(!open(playerName)) {
		throw Error('Unable to open MediaPlayer with name "' + playerName + '"');
	}
	
	// Return the instance
	return this;
};

/*
 * Exports are the publicly accessible functions
 */
module.exports = {
		MediaPlayer: MediaPlayer,
		
		// Enumeration of media node types.
		MediaNodeType: MediaNodeType,
		
		// Enumeration of media player statuses.
		PlayerStatus: PlayerStatus,
		
		// Enumeration of media source change event types.
		MediaSourceEvent: MediaSourceEvent,
		
		// Enumeration of media source types.
		MediaSourceType: MediaSourceType,
		
		// Enumeration of tracksession change event types.
		TrackSessionEvent: TrackSessionEvent,
		
		//  Enumeration of repeat modes.
		RepeatMode: RepeatMode,
		
		//  Enumeration of shuffle modes.
		ShuffleMode: ShuffleMode
};