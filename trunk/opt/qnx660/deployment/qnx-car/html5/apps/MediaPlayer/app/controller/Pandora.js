/**
 * The controller responsible for the integrated Pandora player.
 * @author lgreenway@lixar.com
 *
 * $Id: Pandora.js 6867 2013-07-22 14:08:37Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.controller.Pandora', {
	extend: 'MediaPlayer.controller.Media',

	requires: [
		'MediaPlayer.view.radio.pandora.LoginDialog',
	],

	config: {
		refs: {
			radio				: 'radioView',
			index				: 'pandoraView',

			menuShowButton		: 'pandoraView menuShowButton',

			albumArt			: 'pandoraAlbumArt',
			nowPlaying			: 'pandoraNowPlaying',
			feedbackControls	: 'pandoraFeedbackControls',
			mediaControls		: 'pandoraMediaControls',

			pandoraLoginDialog	: { selector: 'pandoraLoginDialog', xtype: 'pandoraLoginDialog', autoCreate: true },
		},
		
		control: {
			feedbackControls: {
				'thumbUp'	: 'thumbUp',
				'thumbDown'	: 'thumbDown',
			},
			mediaControls: {
				'pause'			: 'pause',
				'resume'		: 'resume',
				'skip'			: 'skip',
			},
		},
		
		/**
		 * Pandora Station data store.
		 */
		stationStore: null,
		
		/**
		 * Radio Source data store.
		 */
		radioSourceStore: null,
	},

	
	/**
	 * Initializes the controller on app startup
	 */
	init: function() {
		this.getApplication().on({
			pandora_index			: this.onPandoraIndex,
			
			pandora_login			: this.onPandoraLogin,
			pandora_selectStation	: this.selectStation,
			pandora_remote			: this.onPandoraRemote,

			audio_index				: this.pause,
			audio_play				: this.pause,
			radiotuner_index		: this.pause,
			video_index				: this.pause,
			video_play				: this.pause,

			scope					: this
		});
		
		
		// Initialize the stores
		this.setStationStore(Ext.getStore('PandoraStations'));
		this.setRadioSourceStore(Ext.getStore('RadioSources'));
	},
	
	/**
	 * Method called when app is ready to launch.
	 */
	launch: function() {
		this.getMenuShowButton().element.on({
			touchstart: function() { this.getApplication().fireEvent('menu_show'); },
			scope: this
		});
	},

	/**
	 * Shows the Pandora player.
	 */
	onPandoraIndex: function() {
		this.getRadio().setActiveItem(this.getIndex());
		Ext.Viewport.setActiveItem(this.getRadio());
	},
	
	/**
	 * pandora_login application event handler. Calls the
	 * {@link MediaPlayer.controller.Pandora#login login}
	 * function.
	 */
	onPandoraLogin: function(e) {
		// Validate event data
		if(e
			&& e.username && e.username.trim() != ''
			&& e.password && e.password.trim() != '')
		{
			this.login(e.username, e.password);
		}
	},
	
	/**
	 * pandora_remote application event handler. Presents the 
	 * login dialog if the user has not signed in or calls the 
	 * pandora index function.
	 */
	onPandoraRemote: function() {
		if (Ext.getStore('RadioSources').getById('pandora').data.available) 
		{
			this.onPandoraIndex();
		} else {
			var loginDialog = this.getPandoraLoginDialog();
			Ext.Viewport.add(loginDialog);
			loginDialog.show();
		}
	},

	/**
	 * Initializes and logs into the Pandora API service.
	 * @param username {String} The Pandora username to log in with
	 * @param password {String} The Pandora password for the username
	 */
	login: function(username, password) {
		var configuration = {
			"partnerName": "qnx2",
			"partnerPassword": "1CFBA9229DDF1F6AE65E68756F48455216B22F0ECEF4CD74",
			"deviceModel": "qnx9",
			"requestKey": "6D3C5BB356FDB9B8",
			"syncTimeKey": "1CC69C5DD2D6DC0B",
			"version": "4",
			"httpUrl": 'http://tuner-beta.savagebeast.com:8001/services/json/',
			"httpsUrl": 'https://tuner-beta.savagebeast.com:8443/services/json/',
			"debug":  true,
			'username': username,
			'password': password
		};
		
		Pandora.start(configuration, this);
	},
	
	/**
	 * Marks the currently playing track with a thumbs up.
	 */
	thumbUp: function() {
		Pandora.thumbUp();
	},
	
	/**
	 * Marks the currently playing track with a thumbs down.
	 */
	thumbDown: function() {
		Pandora.thumbDown();
	},
						
	/**
	 * Marks the currently playing track with a thumbs up.
	 */
	play: function() {
		Pandora.play();
	},

	/**
	 * Pauses playback.
	 */
	pause: function() {
		Pandora.pause();
	},
	
	/**
	 * Resumes playback.
	 */
	resume: function() {
		Pandora.resume();
	},

	/**
	 * Skips the current track.
	 */
	skip: function() {
		Pandora.skip();
	},
	
	/**
	 * pandora_selectStation application event handler. This function
	 * can also be called directly, with the first argument being the
	 * station token to be selected.
	 * @param e {String/Object} Either the station token, or the
	 * 	application event containing the station token.
	 */
	selectStation: function(e) {
		Pandora.selectStation(e.stationToken ? e.stationToken : e);

		// Set the Pandora view as active
		this.getApplication().fireEvent('pandora_index');
	},
	
	/**
	 * Create station stub.
	 */
	createStation: function(stationToken) {
		throw new Error('Not implemented');
	},
	
	/**
	 * Create station stub.
	 */
	deleteStation: function(stationToken) {
		throw new Error('Not implemented');
	},
	
	/**
	 * Populates the Pandora Station data store with a list of
	 * pandora stations.
	 * @param stationList {Array} The list of pandora station objects to
	 * 	add to the store.
	 */
	populateStationStore: function(stationList) {
		this.getStationStore().removeAll();
		this.getStationStore().add(stationList);
	},

	
	// --------------------------
	// Pandora API Event handlers
	// --------------------------
	onApplicationStarted: function(e) {
		// console.log("onApplicationStarted", e);
	},
	
	/**
	 * Pandora API onAuthenticated event handler. Dispatches an
	 * application event notifying the application of the successful
	 * authentication.
	 */
	onAuthenticated: function(currentUser) {
		// console.log("onAuthenticated", currentUser);
		
		// Since we're authenticating, this means that we should show the pandora
		// player immediately since the API will auto-select the previous playlist
		// and begin playback immediately.
		this.getApplication().fireEvent('pandora_index');
	},
	
	onAudioStarted: function(track) {
		// console.log("onAudioStarted", track);
	},
	
	/**
	 * Pandora API onAudioProgress event handler. Updates the view's now playing
	 * track progress information.
	 */
	onAudioProgress: function(progress) {
		// console.log("onAudioProgress: " + JSON.stringify(progress));
		this.getNowPlaying().setTrackProgress(progress.elapsedTime, progress.totalTime);
	},
	
	onAudioEnded: function(track) {
		// console.log("onAudioEnded", track);
	},
	
	onAudioError: function(track) {
		// console.log("onAudioError", track);
	},
	
	/**
	 * Pandora API onTrackChanged event handler. Updates the view's now playing
	 * track and track progress information.
	 */
	onTrackChanged: function(track) {
		// console.log("onTrackChanged", track);
		
		// Update the album art
		this.getAlbumArt().setArtUrl(track.isAd() ? track.imageUrl : track.albumArtUrl);
		
		// Update the now playing information
		this.getNowPlaying().setTrackInfo(track.getTrackName(), track.getArtistName(), track.getAlbumName());
		
		// Reset the progress/total time to 0, since we don't have this information yet
		this.getNowPlaying().setTrackProgress(0, 0);

		// Reset feedback controls
		this.getFeedbackControls().resetThumbState();
		
		// Disable the feedback controls if this is an ad, enable otherwise
		this.getFeedbackControls().setEnableFeedback(track.isAd() ? false : true);
		
		// Now set the thumb state if it's set on the track
		if(track.thumbed && track.thumbed === true)
		{
			this.getFeedbackControls().setThumbState(Ext.getClass(this.getFeedbackControls()).THUMB_UP);
		}
	},
	
	/**
	 * Pandora API onStationListChanged event handler. Updates the Pandora station
	 * data store with the stations.
	 */
	onStationListChanged: function(stationList) {
		// console.log("onStationListChanged");

		// Update the station store
		this.populateStationStore(stationList);
		
		// Modify the Pandora radio source to indicate that the radio
		// source is now available.
		var pandoraRadioSource = this.getRadioSourceStore().findRecord('id', 'pandora');
		if(pandoraRadioSource != null)
		{
			pandoraRadioSource.set('available', true);
		}
		else
		{
			console.warning('Pandora radio source not found');
		}
	},
	
	/**
	 * Pandora API onStationCreated event handler. Updates the Pandora station
	 * data store with the new list of stations.
	 */
	onStationCreated: function(station, stationList) {
		// console.log("onStationCreated: " + station.getName() + " - " + station.getToken());

		// Update the station store
		this.populateStationStore(stationList);
	},
	
	/**
	 * Pandora API onStationDeleted event handler. Updates the Pandora station
	 * data store with the new list of stations.
	 */
	onStationDeleted: function(station, stationList) {
		// console.log("onStationDeleted: " + station.getName());

		// Update the station store
		this.populateStationStore(stationList);
	},
	
	onStationSelected: function(station) {
		// console.log("onStationSelected: " + station.getName());
	},
	
	onSkipFailure: function(track, skip) {
		// console.log("onSkipFailure: " + track.getTrackName() + " - " + JSON.stringify(skip));
	},
	
	onThumbUp: function(track) {
		// console.log("onThumbUp: " + track.getTrackName());
	},
	
	onThumbDown: function(track) {
		// console.log("onThumbDown: " + track.getTrackName());
	},
	
	onPaused: function() {
		// console.log("onPaused: ");
	},
	
	onResumed: function() {
		// console.log("onResumed: ");
	},
	
	onAutoCompletion: function(result){
		// console.log('onAutoCompletion', result);
	},
	
	onApiError: function(data) {
		// console.log("onApiError: " + JSON.stringify(data));
	},
	
	/**
	 * Pandora API onApiFailure event handler. In the instance where this
	 * handler is called in the event of an authentication failure, a
	 * confirmation prompt will pop up asking the user if they'd like to
	 * reload the application, as the only way to recover from an auth
	 * failure is to start from fresh.
	 */
	onApiFailure: function(data) {
		// console.log("onApiFailure: " + JSON.stringify(data));
		
		//if login fail then we need to reload the app
		if (data["method"] == "auth.userLogin") {
			console.error("Pandora API authentication failed.");
			Ext.Msg.confirm('Sign In Error', 'Unable to sign into Pandora. Application must reload to try again. Reload now?', this.confirmReload);
		}
	},
	
	/**
	 * Confirm reload callback function. If the user selects 'yes'
	 * for the window reload confirmation, the window will reload
	 * its contents.
	 * @param buttonId {String} 'yes', 'no', 'ok', or 'cancel'
	 */
	confirmReload: function(buttonId) {
		if(buttonId == 'yes')
		{
			window.location.reload();
		}
	}
	
});
