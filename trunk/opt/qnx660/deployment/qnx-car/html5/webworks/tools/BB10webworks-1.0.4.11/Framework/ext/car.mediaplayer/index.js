/**
 * car.mediaplayer index.js.
 * Responsible for defining the blackberry.event action map, initializing the mediaplayer.js implementation,
 * and routing synchronous and asynchronous calls to the mediaplayer.js implementation.
 *
 * @author lgreenway@qnx.com
 * $Id: index.js 7375 2013-10-21 19:08:25Z nschultz@qnx.com $
 */

var Event = require("./enum/Event"),
	_wwfix = require("../../lib/wwfix"),
	_event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
	_mediaplayer = require("./mediaplayer"),
	_actionMap = {};

/**
 * @event
 * Triggered when the a media source is added, updated, or removed.
 */
_actionMap[Event.MEDIA_SOURCE_CHANGE] = {
	context: require("./context"),
	event: Event.MEDIA_SOURCE_CHANGE,
	trigger: function(args) {
		_event.trigger(Event.MEDIA_SOURCE_CHANGE, args);	
	}
};

/**
 * @event
 * Triggered when the current player's track session has changed.
 */
_actionMap[Event.TRACK_SESSION_CHANGE] = {
	context: require("./context"),
	event: Event.TRACK_SESSION_CHANGE,
	trigger: function(args) {
		_event.trigger(Event.TRACK_SESSION_CHANGE, args);	
	}
};

/**
 * @event
 * Triggered when the current player's play state, play speed, repeat mode, or shuffle mode has changed.
 */
_actionMap[Event.PLAYER_STATE_CHANGE] = {
	context: require("./context"),
	event: Event.PLAYER_STATE_CHANGE,
	trigger: function(args) {
		_event.trigger(Event.PLAYER_STATE_CHANGE, args);	
	}
};

/**
 * @event
 * Triggered when the current player's track has changed.
 */
_actionMap[Event.TRACK_CHANGE] = {
	context: require("./context"),
	event: Event.TRACK_CHANGE,
	trigger: function(args) {
		_event.trigger(Event.TRACK_CHANGE, args);	
	}
};

/**
 * @event
 * Triggered when the current player's track position (progress) has changed.
 */
_actionMap[Event.TRACK_POSITION_CHANGE] = {
	context: require("./context"),
	event: Event.TRACK_POSITION_CHANGE,
	trigger: function(args) {
		_event.trigger(Event.TRACK_POSITION_CHANGE, args);	
	}
};

/**
 * Utility function which validates the existence and proper typing of an arguments object, as well as to define default values
 * on for omitted optional arguments.
 * @param {Object} args The arguments object.
 * @param {Object} config The argument configuration object.
 * @returns {Boolean} True if the arguments pass validation against the configuration, False if not.
 * @private
 */
function validateArguments(args, config) {
	var valid = true;

	// Validate function arguments
	if(typeof args !== 'object' || typeof config !== 'object') {
		console.error('car.mediaplayer/index.js::validateArguments - Invalid arguments.');
		throw new TypeError('Invalid arguments.');
	}
	
	// Iterate through each item in the configuration object
	for(var name in config) {
		var type = config[name].type,
			nullable = config[name].nullable,
			optional = config[name].optional,
			defaultValue = config[name].defaultValue;
		
		// Set the default value if the argument is optional and undefined
		if(args[name] === undefined && optional && defaultValue !== undefined) {
			args[name] = defaultValue;
		}
		
		// Validate the argument
		if((args[name] === undefined && !optional)
			|| (typeof args[name] !== type && (!nullable || nullable && args[name] !== null))) {
			console.warn('car.mediaplayer/index.js::validateArguments - ' +
					'Invalid value ' + args[name] +
					' for argument ' + name + '.' +
					' Configuration: ' + JSON.stringify(config[name]));
			valid = false;
			break;
		}
	}
	
	return valid;
}

/**
 * Initializes the extension
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
		_mediaplayer.init();
	} catch (ex) {
		console.error('Error in webworks ext: mediaplayer/index.js::init():', ex);
	}
}

// Initialize immediately
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Opens the specified player name.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		name: {String}
	 *	}
	 * @param env {Object} Environment variables
	 */
	open: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::open', args);
		try {
			var fixedArgs = _wwfix.parseArgs(args);
			success(_mediaplayer.open(fixedArgs.playerName));
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Closes the specified player name.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		name: {String}
	 *	}
	 * @param env {Object} Environment variables
	 */
	close: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::close', args);
		try {
			var fixedArgs = _wwfix.parseArgs(args);
			success(_mediaplayer.close(fixedArgs.playerName));
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Returns the list of available media sources connected to the device.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied.
	 * @param env {Object} Environment variables
	 */
	getMediaSources: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::getMediaSources', args);
		try {
			_mediaplayer.getMediaSources(success, fail);
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Browse a media source for media.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		mediaSourceId: {Number},
	 *		mediaNodeId: {String},
	 *		limit: {Number},
	 *		offset: {Number}
	 *	}
	 * @param env {Object} Environment variables
	 */
	browse: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::browse', args);
		try {
			var fixedArgs = _wwfix.parseArgs(args);
			
			_mediaplayer.browse(
					success,
					fail,
					fixedArgs.mediaSourceId,
					fixedArgs.mediaNodeId,
					fixedArgs.limit,
					fixedArgs.offset);
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Search for media items in a specific media source.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		mediaSourceId: {Number},
	 *		searchTerm: {String},
	 *		filter: {String},
	 *		limit: {Number},
	 *		offset: {Number}
	 *	}
	 * @param env {Object} Environment variables
	 */
	search: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::search', args);
		try {
			var fixedArgs = _wwfix.parseArgs(args);
			
			_mediaplayer.search(
					success,
					fail,
					fixedArgs.mediaSourceId,
					fixedArgs.searchTerm,
					fixedArgs.filter,
					fixedArgs.limit,
					fixedArgs.offset);
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Creates a new track session.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	createTrackSession: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::createTrackSession', args);
		try {
			var fixedArgs = _wwfix.parseArgs(args);

			// Ensure media source ID is a number
			fixedArgs.mediaSourceId = fixedArgs.mediaSourceId;

			if(!validateArguments(fixedArgs, {
				mediaSourceId: { type: 'number' },
				mediaNodeId: { type: 'string', nullable: true, optional: true, defaultValue: null },
				index: { type: 'number', optional: true, defaultValue: 0 },
				limit: { type: 'number', optional: true, defaultValue: -1 }
			})) {
				fail(-1, 'Invalid arguments.');
			} else {
				_mediaplayer.createTrackSession(
						success,
						fail,
						fixedArgs.mediaSourceId,
						fixedArgs.mediaNodeId,
						fixedArgs.index,
						fixedArgs.limit);
			}
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Destroys an existing track session.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		trackSessionId: {Number}
	 *	}
	 * @param env {Object} Environment variables
	 */
	destroyTrackSession: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::destroyTrackSession', args);
		try {
			var fixedArgs = _wwfix.parseArgs(args);
			
			_mediaplayer.destroyTrackSession(fixedArgs.trackSessionId);
			success();
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Retrieves the current track session information.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied.
	 * @param env {Object} Environment variables
	 */
	getTrackSessionInfo: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::getTrackSessionInfo', args);
		try {
			_mediaplayer.getTrackSessionInfo(success, fail);
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Retrieves media from the current track session.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		limit: {Number},
	 *		offset: {Number}
	 *	}
	 * @param env {Object} Environment variables
	 */
	getTrackSessionItems: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::getTrackSessionItems', args);
		try {
			var fixedArgs = _wwfix.parseArgs(args);
			
			_mediaplayer.getTrackSessionItems(
					success,
					fail,
					fixedArgs.limit,
					fixedArgs.offset);
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Retrieves the currently playing track information.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied.
	 * @param env {Object} Environment variables
	 */
	getCurrentTrack: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::getCurrentTrack', args);
		try {
			_mediaplayer.getCurrentTrack(success, fail);
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Retrieve the current playback position, in milliseconds, of the current track.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied.
	 * @param env {Object} Environment variables
	 */
	getCurrentTrackPosition: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::getCurrentTrackPosition', args);
		try {
			_mediaplayer.getCurrentTrackPosition(success, fail);
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Retrieves metadata for specified media.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		mediaSourceId: {Number},
	 *		mediaNodeId: {String}
	 *	}
	 * @param env {Object} Environment variables
	 */
	getMetadata: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::getMetadata', args);
		try {
			var fixedArgs = _wwfix.parseArgs(args);
			
			_mediaplayer.getMetadata(
					success,
					fail,
					fixedArgs.mediaSourceId,
					fixedArgs.mediaNodeId
				);
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Retrieves extended metadata properties for the specified media.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		mediaSourceId: {Number},
	 *		mediaNodeId: {String},
	 *		properties: {String[]}
	 *	}
	 * @param env {Object} Environment variables
	 */
	getExtendedMetadata: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::getExtendedMetadata', args);
		try {
			var fixedArgs = _wwfix.parseArgs(args);
			
			_mediaplayer.getExtendedMetadata(
					success,
					fail,
					fixedArgs.mediaSourceId,
					fixedArgs.mediaNodeId,
					fixedArgs.properties
				);
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Returns the state of the media player.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied.
	 * @param env {Object} Environment variables
	 */
	getPlayerState: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::getPlayerState', args);
		try {
			_mediaplayer.getPlayerState(success, fail);
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Play or resume playback.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied.
	 * @param env {Object} Environment variables
	 */
	play: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::play', args);
		try {
			success(_mediaplayer.play());
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Pause playback.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	pause: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::pause', args);
		try {
			success(_mediaplayer.pause());
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Stop playback.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	stop: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::stop', args);
		try {
			success(_mediaplayer.resume());
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Skip to the next track in the active track session.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	next: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::next', args);
		try {
			success(_mediaplayer.next());
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Skip to the previous track in the active track session.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	previous: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::previous', args);
		try {
			success(_mediaplayer.previous());
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Jumps to the specified index in the current track session.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		index: {Number}
	 *	}
	 * @param env {Object} Environment variables
	 */
	jump: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::jump', args);
		try {
			var fixedArgs = _wwfix.parseArgs(args);
			success(_mediaplayer.jump(fixedArgs.index));
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Seek to a specific position in the current track.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		position: {Number}
	 *	}
	 * @param env {Object} Environment variables
	 */
	seek: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::seek', args);
		try {
			var fixedArgs = _wwfix.parseArgs(args);
			success(_mediaplayer.seek(fixedArgs.position));
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Set the playback rate of the media player.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		playbackRate: {Number}
	 *	}
	 * @param env {Object} Environment variables
	 */
	setPlaybackRate: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::setPlaybackRate', args);
		try {
			var fixedArgs = _wwfix.parseArgs(args);
			success(_mediaplayer.setPlaybackRate(fixedArgs.playbackRate));
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Set the shuffle mode for the active track session.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		shuffleMode: {MediaPlayer.ShuffleMode}
	 *	}
	 * @param env {Object} Environment variables
	 */
	shuffle: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::shuffle', args);
		try {
			var fixedArgs = _wwfix.parseArgs(args);
			success(_mediaplayer.shuffle(fixedArgs.shuffleMode));
		} catch (ex) {
			fail(-1, ex);
		}
	},
	
	/**
	 * Set the repeat mode for the active track session.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		repeatMode: {MediaPlayer.RepeatMode}
	 *	}
	 * @param env {Object} Environment variables
	 */
	repeat: function(success, fail, args, env) {
		console.log('car.mediaplayer/index.js::repeat', args);
		try {
			var fixedArgs = _wwfix.parseArgs(args);
			success(_mediaplayer.repeat(fixedArgs.repeatMode));
		} catch (ex) {
			fail(-1, ex);
		}
	},
};

