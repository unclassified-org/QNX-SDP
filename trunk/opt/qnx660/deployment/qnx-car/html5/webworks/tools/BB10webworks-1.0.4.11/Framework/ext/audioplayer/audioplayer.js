/**
 * The abstraction layer for audio player functionality
 *
 * @author mlapierre
 * $Id: audioplayer.js 4477 2012-10-01 15:17:21Z mlapierre@qnx.com $
 */

var	_pps = require('../../lib/pps/ppsUtils'),
	_statusReaderPPS,
	_controlReaderPPS,
	_writerPPS,
	_stateTrigger,
	_trackTrigger,
	_updateTrigger,
	
	PLAYER_NAME = 'mpaudio',
	TRACKSESSION_NAME = 'mpaudio_trksession',
	
	SQL_BASE = "SELECT " +
		"coalesce(nullif(trim(am.url), ''), m.mountpath || f.basepath || fi.filename) AS url, " +
		"fi.fid as userdata " +
		"FROM mediastore_metadata m, folders f " +
		"LEFT JOIN files fi ON f.folderid = fi.folderid " +
		"INNER JOIN audio_metadata am ON am.fid = fi.fid ",
		
	SQL_ALL = SQL_BASE +
		"ORDER BY upper(title)",

	SQL_ALBUM = SQL_BASE +
		"AND album_id = {0} " +
		"ORDER BY disc, track",
	
	SQL_ARTIST = SQL_BASE +
		"AND artist_id = {0} " +
		"ORDER BY album_id, disc, track",

	SQL_GENRE = SQL_BASE +
		"AND genre_id = {0} " +
		"ORDER BY upper(title)",
		
	TYPE_ALBUM	= "TYPE_ALBUM",
	TYPE_ARTIST = "TYPE_ARTIST",
	TYPE_GENRE 	= "TYPE_GENRE",
	TYPE_ALL 	= "TYPE_ALL",
		
	STATE_PAUSED	= 'PAUSED',
	STATE_IDLE		= 'IDLE',
	STATE_STOPPED	= 'STOPPED',
	STATE_PLAYING	= 'PLAYING',
	
	REPEAT_ONE 	= 'one',
	REPEAT_ALL 	= 'all',
	REPEAT_NONE	= 'none',

	SHUFFLE_ON 	= 'random',
	SHUFFLE_OFF	= 'sequential';

/**
 * Method called when the mm-control pps status object changes
 * @param event {Object} The PPS event
 */
function onMMStatusEvent(event) {
	if (event && event.changed && event.data) {
		var data = {};
		
		if (event.changed.duration) {
			data["duration"] = event.data.duration;
		}

		if (event.changed.position) {
			data["position"] = event.data.position;
		}

		if (event.changed.fid) {
			data["fid"] = event.data.fid;
		}

		if (event.changed.dbpath) {
			data["dbpath"] = event.data.dbpath;
		}

		if (event.changed.db_timestamp) {
			data["dbready"] = true;
		}

		if (event.changed.trksession) {
			data["trksession"] = event.data.trksession;
		}

		if (event.changed.trkid) {
			data["index"] = event.data.trkid;
			if (_trackTrigger && event.changed.db_timestamp == undefined) {
				//only dispatch a track change event if the tracksession is not changing
				_trackTrigger(data);
			}
		}
		
		//trigger a state update if the state changed
		if (_stateTrigger && event.changed.state) {
			_stateTrigger({ state: event.data.state });
		}

		//send the regular update
		if (_updateTrigger) {
			_updateTrigger(data);
		}
	}
}

/**
 * Method called when the mm-control control object changes
 * @param event {Object} The PPS event
 */
function onControlEvent(event) {
	if (event && event.data && event.data.res == "player_create") {

		if (typeof event.data.dat == "object") {
			//player was newly created, attach the default zone
			_writerPPS.write({
				msg: 'player_attach_zone',
				dat: {
					player: PLAYER_NAME,
					zone: 'audio'
				}
			});

			//add a listener for the player status
			initializeStatusReaderPPS(event.data.dat.status_path);
		} else if (event.data.err == "17") {
			//player already exists. parse out the name from thje error string.
			var playerName = /Player ([A-z0-9]+) ?/.exec(event.data.errstr)[1];

			//add a listener for the player status
			initializeStatusReaderPPS('/pps/services/mm-control/' + playerName + '/status');
		}
	}
}

/**
 * Opens the specified status PPS object in read-only mode and attaches the status object change event handler.
 * @param {String} ppsPath The path to the PPS object.
 */
function initializeStatusReaderPPS(ppsPath) {
	/*
	 * Note that if the status PPS object has already been initialized, it will not initialize again. This means that
	 * if the player name reported by the command object is different than that which was already used to initialize
	 * the status PPS obj, we'll ignore it, and keep using the initial player name. Currently, there's only ever one
	 * player name used, so this isn't an issue.
	 */
	if(!_statusReaderPPS && ppsPath) {
		_statusReaderPPS = _pps.createObject();
		_statusReaderPPS.init();
		_statusReaderPPS.onChange = onMMStatusEvent;
		_statusReaderPPS.open(ppsPath, JNEXT.PPS_RDONLY);
		_statusReaderPPS.read();
	}
}

/**
 * Generates a sql statement for the tracksession manager based on a config object
 * @param config {Object} The config object passed to setTrackSession()
 */
function getSql(config) {
	switch (config.type) {
		case TYPE_ALL: 
			return SQL_ALL;
			break;
			
		case TYPE_ARTIST: 
			return SQL_ARTIST.format(config.id);
			break;

		case TYPE_ALBUM: 
			return SQL_ALBUM.format(config.id);
			break;

		case TYPE_GENRE: 
			return SQL_GENRE.format(config.id);
			break;
	}
	return null;
}

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Initializes the extension 
	 */
	init: function() {
		_controlReaderPPS = _pps.createObject();
		_controlReaderPPS.init();
		_controlReaderPPS.onChange = onControlEvent;
		_controlReaderPPS.open("/pps/services/mm-control/control", JNEXT.PPS_RDONLY);

		_writerPPS = _pps.createObject();
		_writerPPS.init();
		_writerPPS.open("/pps/services/mm-control/control", JNEXT.PPS_WRONLY);

		_writerPPS.write({
			msg: 'player_create',
			dat: {
				name: PLAYER_NAME,
			}
		});
	},
	
	/**
	 * Sets the trigger function to call when a state event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setStateTrigger: function(trigger) {
		_stateTrigger = trigger;
	},

	/**
	 * Sets the trigger function to call when a track event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setTrackTrigger: function(trigger) {
		_trackTrigger = trigger;
	},

	/**
	 * Sets the trigger function to call when an update event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setUpdateTrigger: function(trigger) {
		_updateTrigger = trigger;
	},

	/**
	 * Set a new active track session
	 * @param config {Object} A track session config object detailling the query to make.
	 * Ex: 
	 * {
	 *		source: {Object}, //as returned by qnx.mediasource.get()
	 * 		type: [TYPE_ARTIST | TYPE_ALBUM | TYPE_GENRE | TYPE_ALL | TYPE_SEARCH], //one of the TYPE_ constants from this class
	 * 		id: {Number}, //the id of the element represented in the type. Required for artist, album and genre
	 * }
	 * @param index {Number} [optional] The position in the result set to start playback. Defaults to 0.
	 */
	setTrackSession: function(config, index) {
		
		if (isNaN(index)) {
			index = 0;
		}

		//stop the current playback
		if (_updateTrigger) {
			_updateTrigger({ stopped: true });			
		}
		this.stop();
		
		//setup the new tracksession
		_writerPPS.write({
			msg: 'trksession_delete',
			dat: {
				name: TRACKSESSION_NAME,
			}
		});

		_writerPPS.write({
			msg: 'trksession_create',
			dat: {
				name: TRACKSESSION_NAME,
				media_source: config.source.id,
			}
		});

		_writerPPS.write({
			msg: 'trksession_import',
			dat: {
				name: TRACKSESSION_NAME,
				url: getSql(config)
			}
		});

		_writerPPS.write({
			msg: 'player_set_trksession',
			dat: {
				player: PLAYER_NAME,
				trksession: TRACKSESSION_NAME,
				idx: index,
			}
		});
	},
	
	/**
	 * Start playing at the current position
	 */
	play: function() {
		_writerPPS.write({
			msg: 'player_set_speed',
			dat: {
				player: PLAYER_NAME,
				speed: 1000,
			}
		});

		_writerPPS.write({
			msg: 'player_play',
			dat: {
				player: PLAYER_NAME,
			}
		});
	},

	/**
	 * Start playing the song at the specified index within the current tracksession
	 * @param index {Number} The index of the song to play in the current track session
	 */
	playAt: function(index) {
		_writerPPS.write({
			msg: 'player_set_current',
			dat: {
				player: PLAYER_NAME,
				index: index,
			}
		});
		this.play();
	},

	/**
	 * Pause playback
	 */
	pause: function() {
		_writerPPS.write({
			msg: 'player_set_speed',
			dat: {
				player: PLAYER_NAME,
				speed: 0,
			}
		});
	},

	/**
	 * Stop playback
	 */
	stop: function() {
		_writerPPS.write({
			msg: 'player_stop',
			dat: {
				player: PLAYER_NAME,
			}
		});
	},

	/**
	 * Go to the next track
	 */
	next: function() {
		_writerPPS.write({
			msg: 'player_next_track',
			dat: {
				player: PLAYER_NAME,
			}
		});
	},

	/**
	 * Go to the previous track
	 */
	prev: function() {
		_writerPPS.write({
			msg: 'player_previous_track',
			dat: {
				player: PLAYER_NAME,
			}
		});
	},
	
	/**
	 * Seek to a position in the current track and resume playback
	 * @param position {Number} The position in ms to seek to
	 */
	seek: function(position) {
		_writerPPS.write({
			msg: 'player_set_position',
			dat: {
				player: PLAYER_NAME,
				position: "" + position,
			}
		});
		this.play();
	},
	
	/**
	 * Sets the shuffle setting for the current track session
	 * @param shuffleMode {String} One of the shuffle constants from this class [SHUFFLE_ON|SHUFFLE_OFF]
	 * @param from {Number} The index to start shuffling [Optional; defaults to 0]
	 * @param to {Number} The index to stop shuffling at [Optional; defaults to tracksession length]
	 */
	setShuffle: function(shuffleMode, from, to) {
		switch (shuffleMode) {
			case SHUFFLE_ON:
			case SHUFFLE_OFF:
				_writerPPS.write({
					msg: 'player_set_read_mode',
					dat: {
						player: PLAYER_NAME,
						mode: shuffleMode,
					}
				});
				break;
		}
	},
	
	/**
	 * Gets the shuffle setting for the current track session
	 * @returns {String} One of the shuffle constants from this class [SHUFFLE_ON|SHUFFLE_OFF]
	 */
	getShuffle: function() {
		//TODO
		return null;
	},
	
	/**
	 * Sets repeat setting for the current track session
	 * @param repeatMode {String} One of the repeat constants from this class [REPEAT_ONE|REPEAT_ALL|REPEAT_NONE]
	 */
	setRepeat: function(repeatMode) {
		switch (repeatMode) {
			case REPEAT_ALL:
			case REPEAT_ONE:
			case REPEAT_NONE:
				_writerPPS.write({
					msg: 'player_set_repeat_mode',
					dat: {
						player: PLAYER_NAME,
						mode: repeatMode,
					}
				});
				break;
		}
	},
	
	/**
	 * Gets the repeat setting for the current track session
	 * @returns {String} One of the repeat constants from this class [REPEAT_ONE|REPEAT_ALL|REPEAT_NONE]
	 */
	getRepeat: function() {
		//TODO
		return null;
	},
	
	/**
	 * Determine if media playback is currently stopped
	 * @return {Boolean} True if in stopped mode, otherwise false
	 */
	isStopped: function() {
		return (_statusReaderPPS.ppsObj.state == this.STATE_STOPPED || _statusReaderPPS.ppsObj.state == this.STATE_IDLE);
	},
	
	/**
	 * Returns the current media source
	 * @return {Object} the current media source
	 */
	getSource: function() {
		return (_statusReaderPPS && _statusReaderPPS.ppsObj && _statusReaderPPS.ppsObj.dbpath) ? _statusReaderPPS.ppsObj.dbpath : null;
	},
	
	/**
	 * Returns the fid of the current track
	 * @return {Number} the fid of the current track
	 */
	getFid: function() {
		return (_statusReaderPPS && _statusReaderPPS.ppsObj && _statusReaderPPS.ppsObj.fid) ? _statusReaderPPS.ppsObj.fid : null;
	},
};
