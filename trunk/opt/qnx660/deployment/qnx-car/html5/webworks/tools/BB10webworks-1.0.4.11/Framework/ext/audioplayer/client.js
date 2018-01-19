/**
 * @module qnx_xyz_audioplayer
 *
 * @description Access audio playback functionality
 *
 * @deprecated Please use car.mediaplayer instead.
 */
 
/*
 * @author mlapierre
 * $Id$
 */

var _ID = require("./manifest.json").namespace;


/*
 * Exports are the publicly accessible functions
 */
module.exports = {
	
	//constants
	TYPE_ALBUM: 	"TYPE_ALBUM",
	TYPE_ARTIST:	"TYPE_ARTIST",
	TYPE_GENRE: 	"TYPE_GENRE",
	TYPE_ALL: 		"TYPE_ALL",
	
	REPEAT_ONE:		'one',
	REPEAT_ALL:		'all',
	REPEAT_NONE:	'none',

	SHUFFLE_ON:		'random',
	SHUFFLE_OFF:	'sequential',
	
	/**
	 * Set a new active track session
	 * @param {Object} config A track session config object detailing the query to make
	 * @param {Number} index The position in the result set to start playback [optional]; if omitted, defaults to 0
	 * @example 
	 *Parameter config:
	 *{
	 *     source: {Object},    //as returned by qnx.mediasource.get()
	 *     type: {String},      //one of the TYPE_ constants from this class [TYPE_ARTIST | TYPE_ALBUM | TYPE_GENRE | TYPE_ALL | TYPE_SEARCH] 
	 *     ID: {Number},        //the ID of the element represented in the type. Required for artist, album, and genre
	 *}
	 */
	setTrackSession: function(config, index) {
		if (isNaN(index)) {
			index = 0;
		}
		window.webworks.execSync(_ID, 'setTrackSession', { config: config, index: index });
	},
	
	/**
	 * Start playing at the current position
	 */
	play: function() {
		window.webworks.execSync(_ID, 'play');
	},

	/**
	 * Start playing the song at the specified index within the current track session
	 * @param {Number} index The index of the song to play in the current track session
	 */
	playAt: function(index) {
		window.webworks.execSync(_ID, 'playAt', { index: index });
	},

	/**
	 * Pause playback
	 */
	pause: function() {
		window.webworks.execSync(_ID, 'pause');
	},

	/**
	 * Stop playback
	 */
	stop: function() {
		window.webworks.execSync(_ID, 'stop');
	},

	/**
	 * Go to the next track
	 */
	next: function() {
		window.webworks.execSync(_ID, 'next');
	},

	/**
	 * Go to the previous track
	 */
	prev: function() {
		window.webworks.execSync(_ID, 'prev');
	},
	
	/**
	 * Seek to a position in the current track and resume playback
	 * @param {Number} position The position in ms to seek to
	 */
	seek: function(position) {
		window.webworks.execSync(_ID, 'seek', { position: position });
	},
	
	/**
	 * Set the shuffle setting for the current track session
	 * @param {String} shuffleMode One of the shuffle constants from this class [SHUFFLE_ON|SHUFFLE_OFF]
	 * @param {Number} from The index to start shuffling [Optional]; if omitted defaults to 0
	 * @param {Number}  to The index to stop shuffling at [Optional]; if omitted defaults to track session length
	 */
	setShuffle: function(shuffleMode, from, to) {
		if (isNaN(from)) {
			from = 0;
		}
		if (isNaN(to)) {
			to = 0;
		}
		window.webworks.execSync(_ID, 'setShuffle', { shuffleMode: shuffleMode, from: from, to: to });
	},
	
	/**
	 * Get the shuffle setting for the current track session
	 * NOTE: this API is not yet implemented and currently returns null
	 * @returns {String} One of the shuffle constants from this class [SHUFFLE_ON|SHUFFLE_OFF]
	 */
	getShuffle: function() {
		return window.webworks.execSync(_ID, 'getShuffle');
	},
	
	/**
	 * Set repeat setting for the current track session
	 * @param {String} repeatMode One of the repeat constants from this class [REPEAT_ONE|REPEAT_ALL|REPEAT_NONE]
	 */
	setRepeat: function(repeatMode) {
		window.webworks.execSync(_ID, 'setRepeat', { repeatMode: repeatMode });
	},
	
	/**
	 * Get the repeat setting for the current track session
	 * @returns {String} One of the repeat constants from this class [REPEAT_ONE|REPEAT_ALL|REPEAT_NONE]
	 * NOTE: this API is not yet implemented and currently returns null
	 */
	getRepeat: function() {
		return window.webworks.execSync(_ID, 'getRepeat');
	},
	
	/**
	 * Determine if media playback is currently stopped
	 * @return {Boolean} True if in stopped mode, otherwise false
	 */
	isStopped: function() {
		return window.webworks.execSync(_ID, 'isStopped');
	},
	
	/**
	 * Return the current media source
	 * @return {Object} The current media source
	 */
	getSource: function() {
		return window.webworks.execSync(_ID, 'getSource');
	},
	
	/**
	 * Return the fid of the current track
	 * @return {Number} The fid of the current track
	 */
	getFid: function() {
		return window.webworks.execSync(_ID, 'getFid');
	},
};
