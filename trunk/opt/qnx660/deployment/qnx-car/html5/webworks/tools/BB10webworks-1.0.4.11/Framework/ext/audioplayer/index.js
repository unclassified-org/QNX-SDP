/**
* Allows access to mm-control audio playback
 *
 * @author mlapierre
 * $Id: index.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
	_wwfix = require("../../lib/wwfix"),
	_actionMap = {
		/**
		 * @event
		 * Triggered when there is an update to the audio player data
		 */
		audioplayerupdate: {
			context: require("./context"),
			event: "audioplayerupdate",
			trigger: function (args) {
				_event.trigger("audioplayerupdate", args);
			}
		},
		/**
		 * @event
		 * Triggered when the active track changes
		 */
		audioplayertrack: {
			context: require("./context"),
			event: "audioplayertrack",
			trigger: function (args) {
				_event.trigger("audioplayertrack", args);
			}
		},
		/**
		 * @event
		 * Triggered when the audio player starts or stops playing
		 */
		audioplayerstate: {
			context: require("./context"),
			event: "audioplayerstate",
			trigger: function (args) {
				_event.trigger("audioplayerstate", args);
			}
		}
	},
	_audioplayer = require("./audioplayer");

/**
 * Initializes the extension 
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
		_audioplayer.init();
	} catch (ex) {
		console.error('Error in webworks ext: audioplayer/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Set a new active track session
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		config: {
	 *			source: {Object}, //as returned by qnx.mediasource.get()
	 *			type: {String}, //one of the TS_ constants from the client file
	 *			id: {Number}, //the id of the element represented in the type. Required for artist, album and genre
	 *		},
	 *		index: {Number},
	 *	}
	 * @param env {Object} Environment variables
	 */
	setTrackSession: function (success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_audioplayer.setTrackSession(args.config, args.index);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Start playing the song at the current index within the current tracksession
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	play: function(success, fail, args, env) {
		try {
			_audioplayer.play();
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Start playing the song at the specified index within the current tracksession
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		index: {Number},
	 *	}
	 * @param env {Object} Environment variables
	 */
	playAt: function(success, fail, args, env) {
		try {
			console.log('pre', args);
			args = _wwfix.parseArgs(args);
			console.log('post', args);
			_audioplayer.playAt(args.index);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Pause playback
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	pause: function(success, fail, args, env) {
		try {
			_audioplayer.pause();
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Stop playback
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	stop: function(success, fail, args, env) {
		try {
			_audioplayer.stop();
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Go to the next track
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	next: function(success, fail, args, env) {
		try {
			_audioplayer.next();
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Go to the previous track
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	prev: function(success, fail, args, env) {
		try {
			_audioplayer.prev();
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Seek to a position in the current track and resume playback
	 * @param position {Number} The position in ms to seek to
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: 
	 *	{
	 *		position: {Number}, //the position in ms to seek to
	 *	}
	 * @param env {Object} Environment variables
	 */
	seek: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_audioplayer.seek(args.position);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Sets the shuffle setting for the current track session
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		shuffleMode: {String}, //one of SHUFFLE_ON, SHUFFLE_OFF from the client file
	 *		from: {Number}, //the index to start shuffling [Optional; defaults to 0]
	 *		to: {Number}, //the index to stop shuffling at [Optional; defaults to tracksession length]
	 *	}
	 * @param env {Object} Environment variables
	 */
	setShuffle: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_audioplayer.setShuffle(args.shuffleMode, args.from, args.to);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Gets the shuffle setting for the current track session
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getShuffle: function(success, fail, args, env) {
		try {
			var out = _audioplayer.getShuffle();
			success(out);
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Sets repeat setting for the current track session
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		repeatMode: {String}, //one of REPEAT_ONE, REPEAT_ALL or REPEAT_NONE from the client file
	 *	}
	 * @param env {Object} Environment variables
	 */
	setRepeat: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_audioplayer.setRepeat(args.repeatMode);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Gets the repeat setting for the current track session
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getRepeat: function(success, fail, args, env) {
		try {
			var out = _audioplayer.getRepeat();
			success(out);
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Determine if media playback is currently stopped
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	isStopped: function(success, fail, args, env) {
		try {
			var out = _audioplayer.isStopped();
			success(out);
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Returns the current media source
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getSource: function(success, fail, args, env) {
		try {
			var out = _audioplayer.getSource();
			success(out);
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Returns the fid of the current track
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getFid: function(success, fail, args, env) {
		try {
			var out = _audioplayer.getFid();
			success(out);
		} catch (e) {
			fail(-1, e);
		}
	},
};

