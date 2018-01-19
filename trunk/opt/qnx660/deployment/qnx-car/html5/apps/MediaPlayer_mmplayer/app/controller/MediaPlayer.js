/**
 * The car.mediaplayer extension interface for multimedia control.
 * @author lgreenway
 *
 * $Id: MediaPlayer.js 7329 2013-10-10 17:32:51Z nschultz@qnx.com $
 */
Ext.define('MediaPlayer.controller.MediaPlayer', {
	extend: 'Ext.app.Controller',

	requires: ['MediaPlayer.enumeration.ApplicationEvent'],

	statics: {
		/**
		 * The default media player name.
		 */
		PLAYER_NAME: 'HMI'
	},

	/**
	 * The active player name.
	 * @private
	 */
	activePlayerName: null,

	/**
	 * The car.mediaplayer.MediaPlayer instance.
	 * @private
	 */
	mediaPlayer: null,

	/**
	 * Reference to the MediaSources store.
	 * @private
	 */
	mediaSources: null,

	/**
	 * Reference to the SearchSources store.
	 * @private
	 */
	searchSources: null,

	/**
	 * Reference to the PlayerStates store.
	 * @private
	 */
	playerStates: null,

	/**
	 * Reference to the TrackSession store.
	 * @private
	 */
	trackSession: null,

	/**
	 * Reference to the NowPlaying store.
	 * @private
	 */
	nowPlaying: null,

	/**
	 * State flag indicating whether a track session is being created,
	 * pending success or failure. This is used to defer additional commands
	 * which first require the track session to exist.
	 * @private
	 */
	trackSessionCreating: false,

	/**
	 * Deferred commands waiting for the track session to be created.
	 * @private
	 */
	deferredTrackSessionCommands: [],

	/*
	 * The reference to the trackSession web worker
	 * @private
	 */
	trackSessionWebWorker: null,

	init: function() {
		// Initialize local store properties
		this.mediaSources = Ext.getStore('MediaSources');
		this.searchSources = Ext.getStore('SearchSources');
		this.playerStates = Ext.getStore('PlayerStates');
		this.nowPlaying = Ext.getStore('NowPlaying');
		this.trackSession = Ext.getStore('TrackSession');

		// Link the MediaSources and SearchSources store, as the SearchSources store is really just
		// a filtered view into the current state of MediaSources. Add and remove handlers need to be
		// added, but updates are handled automatically since models are added to the SearchSources store
		// by reference.
		this.mediaSources.on({
			addrecords: function(store, records) {
				this.searchSources.add(records);
			},
			removerecords: function(store, records) {
				this.searchSources.remove(records);
			},

			scope: this
		});
		this.initializeTrackSessionWebWorker();
	},

	/**
	 * Initializes the controller on app launch
	 */
	launch: function() {
		// Get an instance of the mm_player media player
		try {
			this.mediaPlayer = new car.mediaplayer.MediaPlayer(MediaPlayer.controller.MediaPlayer.PLAYER_NAME);
		} catch (ex) {
			// FIXME: This is a fatal exception
			console.error('Error creating media player instance with name: ' + MediaPlayer.controller.MediaPlayer.PLAYER_NAME);
		}

		if (this.mediaPlayer) {
			// Set the active player name so that we can reference the player state, now playing information if
			// we need it.
			this.activePlayerName = MediaPlayer.controller.MediaPlayer.PLAYER_NAME;

			// Initialize player state
			this.playerStates.add(Ext.create('MediaPlayer.model.PlayerState', {
				playerName: MediaPlayer.controller.MediaPlayer.PLAYER_NAME
			}));

			// Initialize current track
			this.nowPlaying.add(Ext.create('MediaPlayer.model.NowPlaying', {
				playerName: MediaPlayer.controller.MediaPlayer.PLAYER_NAME
			}));

			// Fire the player connected event. This will inform the rest of the application that we have
			// a player ready, and that there are corresponding PlayerState and NowPlaying models available.
			this.getApplication().fireEvent(MediaPlayer.enumeration.ApplicationEvent.PLAYER_CONNECTED, this.activePlayerName);

			// Attach callbacks
			this.mediaPlayer.watchMediaSource(this.onMediaSourceChange.bind(this));
			this.mediaPlayer.watchTrackSession(this.onTrackSessionChange.bind(this));
			this.mediaPlayer.watchPlayerState(this.onPlayerStateChange.bind(this));
			this.mediaPlayer.watchTrack(this.onTrackChange.bind(this));
			this.mediaPlayer.watchTrackPosition(this.onTrackPositionChange.bind(this));

			// Initialize media sources first
			this.mediaPlayer.getMediaSources(function(data) {
				// Initialize the media source store with the results
				this.initializeMediaSources(data);

				// Check if there is an existing track session, and if so, initialize the track session store
				this.mediaPlayer.getTrackSessionInfo(this.initializeTrackSessionInfo.bind(this));

				// Initialize player state
				this.mediaPlayer.getPlayerState(this.onPlayerStateChange.bind(this));

				// Initialize current track
				this.mediaPlayer.getCurrentTrack(function(data) {
					this.onTrackChange(data);

					// And then finally initialize the current track position. We do this nested within the
					// success handler of the current track initialization since the onTrackChange handler
					// will assume that the current track position is reset to 0 whenever the track changes.
					// Letting the getCurrentTrackPosition function run in parallel could result in a race
					// condition where the position returns first, only to be squashed by the track change
					// handler resetting the position to 0.
					this.mediaPlayer.getCurrentTrackPosition(this.onTrackPositionChange.bind(this));
				}.bind(this));

			}.bind(this));

			// Attach application event handlers
			var eventMap = {
				scope: this
			};
			eventMap[MediaPlayer.enumeration.ApplicationEvent.CMD_CREATE_TRACK_SESSION] = this.createTrackSession;
			eventMap[MediaPlayer.enumeration.ApplicationEvent.CMD_PLAY] = this.play;
			eventMap[MediaPlayer.enumeration.ApplicationEvent.CMD_PAUSE] = this.pause;
			eventMap[MediaPlayer.enumeration.ApplicationEvent.CMD_STOP] = this.stop;
			eventMap[MediaPlayer.enumeration.ApplicationEvent.CMD_NEXT] = this.next;
			eventMap[MediaPlayer.enumeration.ApplicationEvent.CMD_PREVIOUS] = this.previous;
			eventMap[MediaPlayer.enumeration.ApplicationEvent.CMD_JUMP] = this.jump;
			eventMap[MediaPlayer.enumeration.ApplicationEvent.CMD_SEEK] = this.seek;
			eventMap[MediaPlayer.enumeration.ApplicationEvent.CMD_SHUFFLE] = this.shuffle;
			eventMap[MediaPlayer.enumeration.ApplicationEvent.CMD_REPEAT] = this.repeat;

			this.getApplication().on(eventMap);
		}
	},

	/**
	 * Populates the MediaSources store with media sources.
	 * @param {Array} data The array of media sources.
	 * @private
	 */
	initializeMediaSources: function(data) {
		// Route the addition of media sources through the onMediaSourceChange event
		var mediaSources = Ext.Array.from(data);
		for (var i = 0; i < mediaSources.length; i++) {
			this.onMediaSourceChange({
				type: car.mediaplayer.MediaSourceEvent.ADDED,
				mediaSource: mediaSources[i]
			});
		}
	},

	/**
	 * Initialization getTrackSessionInfo success handler. If a track session is present, then tracks will be
	 * loaded into the TrackSession store.
	 * @param {Object} data The track session info result.
	 * @private
	 */
	initializeTrackSessionInfo: function(data) {
		if (typeof data === 'object' && data.hasOwnProperty('trackSessionId') && typeof data.trackSessionId === 'number') {
			this.loadTrackSessionStore(data.trackSessionId);
		}
	},

	/*
	 * Initialize the trackSession web worker and set up the
	 * message passing functions
	 * @private
	 */
	initializeTrackSessionWebWorker: function() {
		// Create the worker
		this.trackSessionWebWorker = new Worker("app/controller/TrackSessionWebWorker.js");

		// setup event handling
		this.trackSessionWebWorker.addEventListener("message", this.handleWebWorkerEvents.bind(this));
		this.trackSessionWebWorker.addEventListener("error", this.handleWebWorkerError.bind(this));
	},
	/*
	 * function to handle and route the events coming from the web worker
	 * @param {Event} the event object form the webworker
	 */
	handleWebWorkerEvents: function(e) {
		switch (e.data.command) {
			case "Fetch_Items":
				this.fetchTrackSessionItems(e.data.limit, e.data.offset);
				break;
			case "TrackSession_Loaded":
				console.log("TrackSession has finished loading");
				break;
			default:
				console.error("Unknown Command coming from the TrackSession Web worker: " + e.data);
		}

	},
	/*
	 *
	 */
	handleWebWorkerError: function(e) {
		console.error("Web Worker Error: ", e.message);
	},
	/**
	 * Handles the addition, modification, and removal of media sources in the the MediaSources store.
	 * @private
	 * @param {Object} data The event data.
	 */
	onMediaSourceChange: function(data) {
		console.log('onMediaSourceChange', data);
		if (typeof data === 'object' && data.hasOwnProperty('type') && data.hasOwnProperty('mediaSource')) {

			if (data.type === car.mediaplayer.MediaSourceEvent.ADDED) {
				// ADD media source
				var mediaSource = Ext.create('MediaPlayer.model.MediaSource', data.mediaSource);
				mediaSource.set('capabilities', Ext.create('MediaPlayer.model.MediaSourceCapabilities', data.mediaSource.capabilities));
				this.mediaSources.add(mediaSource);
			} else if (data.type === car.mediaplayer.MediaSourceEvent.UPDATED) {
				// UPDATE media source
				// Find the media source by id
				var mediaSource = this.mediaSources.findRecord('id', data.mediaSource.id);

				if (mediaSource) {
					// Update the media source data and then recconstruct a MediaSourceCapabilities instance
					mediaSource.beginEdit();
					mediaSource.set(data.mediaSource);
					mediaSource.set('capabilities', Ext.create('MediaPlayer.model.MediaSourceCapabilities', data.mediaSource.capabilities));
					mediaSource.endEdit();
				} else {
					console.warn('MediaPlayer.controller.MediaPlayer::onMediaSourceChange - Unable to update media source ' +
						'with ID \'' + data.mediaSource.id + '\'. Media source not found.');
				}
			} else if (data.type === car.mediaplayer.MediaSourceEvent.REMOVED) {
				// Find the media source by id
				var mediaSource = this.mediaSources.findRecord('id', data.mediaSource.id);

				if (mediaSource) {
					// REMOVE media source
					this.mediaSources.remove(mediaSource);
				} else {
					console.warn('MediaPlayer.controller.MediaPlayer::onMediaSourceChange - Unable to remove media source ' +
						'with ID \'' + data.mediaSource.id + '\'. Media source not found.');
				}
			}

		}
	},

	/**
	 * trackSessionChange watch handler. Updates the TrackSession store with all tracks whenever a track session
	 * is created or appended to, and removes all tracks from the TrackSession store if the track session is destroyed.
	 * @param {Object} data The event data.
	 * @private
	 */
	onTrackSessionChange: function(data) {
		console.log('onTrackSessionChange', data);

		if (typeof data === 'object' && data.hasOwnProperty('type') && data.hasOwnProperty('trackSessionId')) {
			if (data.type === car.mediaplayer.TrackSessionEvent.CREATED) {
				this.loadTrackSessionStore(data);
			} else if (data.type === car.mediaplayer.TrackSessionEvent.APPENDED) {
				this.trackSessionAppend(data);
			} else if (data.type === car.mediaplayer.TrackSessionEvent.DESTROYED) {
				// Remove all tracks from the track session
				this.trackSession.removeAll();
				// Reset the web worker to be ready for a new tracksession
				this.trackSessionWebWorker.postMessage({
					"command": "Reset"
				});
				// FIXME: Currently we only receive a track session destroy event to let the application know that there is longer a current track
				var nowPlaying = this.nowPlaying.findRecord('playerName', this.activePlayerName);
				if (nowPlaying) {
					nowPlaying.beginEdit();
					nowPlaying.set('mediaNode', null);
					nowPlaying.set('index', 0);
					nowPlaying.set('position', 0);
					nowPlaying.endEdit();
				}
			}
		}
	},

	/**
	 * Loads all tracks of the specified track session into the TrackSession store.
	 * @param {Object} data the create event data
	 * @private
	 */
	loadTrackSessionStore: function(data) {
		// Clear existing items
		this.trackSession.removeAll();
		// notify the worker of the created event
		this.trackSessionWebWorker.postMessage({
			"command": "Created",
			"data": data
		});
	},
	/**
	 * Append tracks of the specified track session into the TrackSession store.
	 * @param {Number} trackSessionId The track session ID.
	 * @param {Object} data the append event data
	 * @private
	 */
	trackSessionAppend: function(data) {
		//Notify the worker of the append event
		this.trackSessionWebWorker.postMessage({
			"command": "Append",
			"data": data
		});
	},
	/**
	 *	Function to used to fetch sections of the track session data provided by the web worker
	 *	@param {Number} limit how many items to load
	 * 	@param {Number} offset the point a which to start loading Track Session items
	 *	@private
	 */
	fetchTrackSessionItems: function(limit, offset) {
		this.mediaPlayer.getTrackSessionItems(
			this.trackSessionItemsSuccess.bind(this),
			this.trackSessionItemsFailure.bind(this),
			limit,
			offset);
	},
	/**
	 * trackSessionAppend success callback.
	 * @param {Object} data The getTrackSessionItems success result.
	 * @private
	 */
	trackSessionItemsSuccess: function(data) {
		this.trackSession.add(data);
		// Notify the worker that we are ready to load more
		this.trackSessionWebWorker.postMessage({
			"command": "Fetch_Complete"
		});
	},
	/**
	 * trackSessionAppend error callback.
	 * @param {Object} data The getTrackSessionItems error result.
	 * @private
	 */
	trackSessionItemsFailure: function(data) {
		this.trackSessionWebWorker.postMessage({
			"command": "Fetch_Failed"
		});
	},
	/**
	 * @private
	 * @param {Object} data The event data.
	 */
	onPlayerStateChange: function(data) {
		console.log('onPlayerStateChange', data);

		// Set the player state for the active player
		this.playerStates.findRecord('playerName', this.activePlayerName).set(data);
	},

	/**
	 * @private
	 * @param {Object} data The event data.
	 */
	onTrackChange: function(data) {
		console.log('onTrackChange', data);

		// Create a MediaNode model instance
		var mediaNode = Ext.create('MediaPlayer.model.MediaNode', data.mediaNode);

		// Verify the media node has a known media source ID
		if (!this.mediaSources.findRecord('id', mediaNode.get('mediaSourceId'))) {
			console.warn('MediaPlayer.controller.MediaPlayer::onTrackChange - Unknown media source ID: ' + mediaNode.get('mediaSourceId'));
		}

		// Associate the metadata
		if (data.metadata) {
			mediaNode.set('metadata', Ext.create('MediaPlayer.model.Metadata', data.metadata));
		} else {
			console.warn('MediaPlayer.controller.MediaPlayer::onTrackChange - Metadata not present in event data.');
		}

		// Get the now playing record for the active player
		var nowPlaying = this.nowPlaying.findRecord('playerName', this.activePlayerName);
		if (nowPlaying) {
			// Set the media node as null before updating to force the store to fire an update event, as the metadata
			// for the node may have changed, but the node itself may have not (e.g. Bluetooth A2DP/AVRCP stream).
			nowPlaying.set('mediaNode', null);

			nowPlaying.beginEdit();
			nowPlaying.set('mediaNode', mediaNode);
			nowPlaying.set('index', data.index);
			nowPlaying.set('position', 0);
			nowPlaying.endEdit();
		}
	},

	/**
	 * @private
	 * @param {Object} data The event data.
	 */
	onTrackPositionChange: function(data) {
		if (data && data.position && typeof data.position === 'number') {
			var nowPlaying = this.nowPlaying.findRecord('playerName', this.activePlayerName);
			if (nowPlaying) {
				nowPlaying.set('position', data.position);
			}
		}
	},

	/**
	 * Create track session application event command handler.
	 * @param {Number} mediaSourceId The media source ID.
	 * @param {?String} mediaNodeId The media node ID, or null for the root node.
	 * @param {Number} index The track index to set as current after track session creation.
	 */
	createTrackSession: function(mediaSourceId, mediaNodeId, index) {
		console.log('createTrackSession', arguments);
		if (typeof mediaSourceId === 'number' && (typeof mediaNodeId === 'string' || mediaNodeId === null) && typeof index === 'number') {
			// Set the track session creating flag to true
			this.trackSessionCreating = true;

			this.mediaPlayer.createTrackSession(mediaSourceId,
				this.createTrackSessionSuccess.bind(this),
				this.createTrackSessionError.bind(this),
				mediaNodeId,
				index);
		}
	},

	/**
	 * createTrackSession success callback.
	 * @param {Object} data The createTrackSession success result.
	 * @private
	 */
	createTrackSessionSuccess: function(data) {
		console.log('createTrackSessionSuccess', arguments);

		// Remove the track session creating flag
		this.trackSessionCreating = false;

		// Process the pending track session command queue
		this.processDeferredTrackSessionCommands();
	},

	/**
	 * createTrackSession error callback.
	 * @param {Object} data The createTrackSession error object.
	 * @private
	 */
	createTrackSessionError: function(data) {
		console.error('MediaPlayer.controller.MediaPlayer::createTrackSessionError', data);

		// Remove the track session creating flag
		this.trackSessionCreating = false;

		// Clear the pending command queue since they're no longer valid
		this.clearDeferredTrackSessionCommands();
	},

	/**
	 * Executes or defers commands which must wait to be executed if a track session is in
	 * the process of being created.
	 * @param {Function} fn The function to execute.
	 * @param {Object} scope The scope in which the function should be executed.
	 * @param {Array} args The arguments to supply to the function.
	 * @private
	 */
	executeTrackSessionCommand: function(fn, scope, args) {
		if (this.trackSessionCreating) {
			console.log('MediaPlayer.controller.MediaPlayer::executeTrackSessionCommand - Deferring track session command');
			this.deferredTrackSessionCommands.push(function() {
				fn.apply(scope, args);
			});
		} else {
			fn.apply(scope, args);
		}
	},

	/**
	 * Processes the list of deferred track session commands queued by the
	 * executeTrackSessionCommand function.
	 * @private
	 */
	processDeferredTrackSessionCommands: function() {
		while (this.deferredTrackSessionCommands.length > 0) {
			this.deferredTrackSessionCommands.shift()();
		}
	},

	/**
	 * Clears the list of deferred track session commands queued by the
	 * executeTrackSessionCommand function.
	 * @private
	 */
	clearDeferredTrackSessionCommands: function() {
		console.log('MediaPlayer.controller.MediaPlayer::clearDeferredTrackSessionCommands - Clearing deferred track session ' +
			'command queue of ' + this.deferredTrackSessionCommands.length + ' commands');
		this.deferredTrackSessionCommands = [];
	},

	play: function() {
		console.log('play', arguments);

		this.executeTrackSessionCommand(this.mediaPlayer.play, this, arguments);
	},

	pause: function() {
		console.log('pause', arguments);

		this.mediaPlayer.pause();
	},

	stop: function() {
		console.log('stop', arguments);

		this.mediaPlayer.stop();
	},

	next: function() {
		console.log('next', arguments);

		this.mediaPlayer.next();
	},

	previous: function() {
		console.log('previous', arguments);

		this.mediaPlayer.previous();
	},

	jump: function(index) {
		console.log('jump', arguments);
		if (typeof index === 'number' && index > -1) {
			this.mediaPlayer.jump(index);
		}
	},

	seek: function(position) {
		console.log('seek', arguments);
		if (typeof position === 'number' && position > -1) {
			// Get the current track so that we can determine its duration
			var nowPlaying = this.nowPlaying.findRecord('playerName', this.activePlayerName);

			if (nowPlaying) {
				var mediaNode = nowPlaying.get('mediaNode'),
					metadata = mediaNode ? mediaNode.get('metadata') : null;

				if (metadata) {
					this.mediaPlayer.seek(Math.round(metadata.get('duration') * position / 100));
				} else {
					console.warn('MediaPlayer.controller.Audio::onSeek - Attempting to seek on track with no metadata.');
				}
			}
		}
	},

	setPlaySpeed: function(speed) {
		console.log('setPlaySpeed', arguments);
		if (typeof speed === 'number') {
			this.mediaPlayer.setPlaySpeed(speed);
		}
	},

	shuffle: function(mode) {
		console.log('shuffle', arguments);
		if (mode === car.mediaplayer.ShuffleMode.SHUFFLE_ON || mode === car.mediaplayer.ShuffleMode.SHUFFLE_OFF) {
			this.mediaPlayer.shuffle(mode);
		}
	},

	repeat: function(mode) {
		console.log('repeat', arguments);
		if (mode === car.mediaplayer.RepeatMode.REPEAT_OFF || mode === car.mediaplayer.RepeatMode.REPEAT_ONE || mode === car.mediaplayer.RepeatMode.REPEAT_ALL) {
			this.mediaPlayer.repeat(mode);
		}
	}

});