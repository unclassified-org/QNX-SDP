/**
 * The controller responsible for the menu.
 * @author mlapierre
 *
 * $Id: Menu.js 7792 2013-12-05 19:55:56Z mlapierre@qnx.com $
 */

Ext.define('MediaPlayer.controller.Menu', {
	extend: 'Ext.app.Controller',

	requires: [
		'MediaPlayer.enumeration.ApplicationEvent',
		'MediaPlayer.store.Browse',
		'MediaPlayer.view.radio.pandora.LoginDialog'
	],

	statics: {
		/**
		 * The number of milliseconds for the media source/node item tap event handler debounce configuration.
		 */
		ITEM_TAP_HANDLER_DEBOUNCE_MS: 1000
	},
	
	config:{
		refs: {
			mainMenu			: 'menuView',
			menuStack			: 'menuView > stackedMenu',
			mediaSourcesList	: 'menuMediaSources > list',
			mediaNodesList		: 'menuMedia > list',
			radioSources		: { selector: 'menuRadioSourcesView',		xtype: 'menuRadioSourcesView',		autoCreate: true },
			pandoraStations		: { selector: 'menuPandoraStationsView',	xtype: 'menuPandoraStationsView',	autoCreate: true },
			pandoraLoginDialog	: { selector: 'pandoraLoginDialog', xtype: 'pandoraLoginDialog', autoCreate: true },
		 },
		control: {
			'menuRadioSourcesView > list': {
				itemtap: 'onRadioSourceItemTap'
			},
			'menuPandoraStationsView > list': {
				itemtap: 'onPandoraStationItemTap'
			}
		}
	},

	/**
	 * The ID of the media source currently being browsed.
	 * @private
	 */
	browsingMediaSourceId: null,
	
	/**
	 * Initializes the controller on app startup
	 */
	init: function() {
		this.getApplication().on({
			menu_show			: this.onShow,
			menu_hide			: this.onHide,
			home_index			: this.onHide,
			pandora_index		: this.onHide,
			submenu_hide		: this.hideSubMenus,
			search_index		: this.onHide,
			scope: this
		});
		
		// Add the debounced media source, node menu event listeners
		this.control({
			mediaSourcesList: {
				itemtap: this.createDebounceFunction(this.onMediaSourcesMenuItemTap, this.self.ITEM_TAP_HANDLER_DEBOUNCE_MS, this)
			},
			mediaNodesList: {
				itemtap: this.createDebounceFunction(this.onMediaMenuItemTap, this.self.ITEM_TAP_HANDLER_DEBOUNCE_MS, this)
			}
		});
		
		// Attach update and delete handlers to the MediaSources store so that we can know when
		// to hide browse menus if the media source is disabled or disappears
		Ext.getStore('MediaSources').on({
			updaterecord: this.onMediaSourceUpdated,
			removerecords: this.onMediaSourceRemoved,
			
			scope: this
		});
	},
	
	/**
	 * Method called when app is ready to launch
	 */
	launch: function() {		
		//Hide Menu Button Handler
		var hideButtons = Ext.ComponentQuery.query("menuHideButton");
		for (var i=0; i<hideButtons.length; i++) {
			hideButtons[i].element.on({
				touchstart: function() { this.getApplication().fireEvent('menu_hide'); },
				scope: this
			});
		}
		//Show Menu Button Handler
		var showButtons = Ext.ComponentQuery.query("menuShowButton");
		for (var i = 0; i < showButtons.length; i++) {
			showButtons[i].element.on({
				touchstart:function () {
					this.getApplication().fireEvent('menu_show');
				},
				scope:this
			});
		}
	},

	/**
	 * Returns a debouncing function which can only be called once every number of milliseconds, with immediate execution.
	 * This can be used to prevent functions from being called repeatedly within a specified amount of time.
	 * @param {Function} fn The function.
	 * @param {Number} interval The number of milliseconds following execution to prevent additional execution.
	 * @param {Object} [scope] The scope in which the function is executed. Defaults to the scope of the caller if not
	 * specified.
	 * @returns {Function} The debouncing function.
	 * @private
	 */
	createDebounceFunction: function(fn, interval, scope) {
		var lastCallTime = 0,
			elapsed = 0,
			lastArgs = [],
			execute = function() {
				fn.apply(scope || this, lastArgs);
				lastCallTime = new Date().getTime();
			};

		return function() {
			elapsed = new Date().getTime() - lastCallTime;
			lastArgs = arguments;

			if (!lastCallTime || (elapsed >= interval)) {
				execute();
			}
		};
	},
	
	/**
	 * Method called when we want to show the menu
	 */
	onShow: function() {
		this.getMainMenu().show();
	},
	
	/**
	 * Method called when we want to hide the menu
	 */
	onHide: function() {
		this.getMainMenu().hide();
	},
	
	/**
	 * Method called when we want to hide the submenus
	 */
	hideSubMenus: function() {
		this.getMenuStack().hideAllSubMenus(!this.getMenuStack().isHidden());
		this.browsingMediaSourceId = null;
	},
	
	/**
	 * Method called when a media source is updated.
	 * @param {Ext.data.Store} store The store which fired the event.
	 * @param {Ext.data.Model} record The Model instance that was updated.
	 * @private
	 */
	onMediaSourceUpdated: function(store, record) {
		if (record.get('id') === this.browsingMediaSourceId && record.get('ready') === false) {
			this.hideSubMenus();
		}
	},
	
	/**
	 * Method called when a media source is removed.
	 * @param {Ext.data.Store} store The store which fired the event.
	 * @param {Ext.data.Model[]} records The Model instances that were removed.
	 * @private
	 */
	onMediaSourceRemoved: function(store, records) {
		for(var i in Ext.Array.from(records)) {
			if(records[i].get('id') === this.browsingMediaSourceId) {
				this.hideSubMenus();
				break;
			}
		}
	},
	
	/**
	 * Event handler triggered when an item is tapped on the Main menu
	 * @param dv {Object} The dataview containing the item
	 * @param index {Number} The index of the tapped item
	 * @param target {Object} The data item that was tapped
	 * @param record {Object} The RadioSource record associated with the item
	 * @private
	 */
	onMediaSourcesMenuItemTap: function (dv, index, target, record) {
		// FIXME: Use constant
		if (record.get('id') === "radio") {
			this.getMenuStack().push(this.getRadioSources());
		} else {
			if(record.get('ready')) {
				// JI:422689 - Play all Bluetooth sources immediately
				// FIXME: This is a workaround until the API can support 'streaming' a non-browseable media source in some way
				if(record.get('type') === car.mediaplayer.MediaSourceType.BLUETOOTH) {
					this.playAudio(record.get('id'), null, 0);
				} else {
					// Set the currently browsing media source ID and browse the media source from its root
					this.browsingMediaSourceId = record.get('id');
					this.browseMedia(record.get('id'), null);
				}
			} else {
				Ext.Msg.alert('Warning', 'This media source is not ready yet.', Ext.emptyFn);
			}
		}
	},
	
	/**
	 * Event handler triggered when an item is tapped on a media menu
	 * @param dv {Object} The dataview containing the item
	 * @param index {Number} The index of the tapped item
	 * @param target {Object} The data item that was tapped
	 * @param record {Object} The RadioSource record associated with the item
	 * @private
	 */
	onMediaMenuItemTap: function(dv, index, target, record) {
		if(record.get('type') === car.mediaplayer.MediaNodeType.FOLDER) {
			// Node type is a folder, so browse
			this.browseMedia(record.get('mediaSourceId'), record.get('id'));
		} else if(record.get('type') === car.mediaplayer.MediaNodeType.AUDIO) {
			this.playAudio(record.get('mediaSourceId'),
				dv.getStore().getMediaNodeId(),	// We actually want to play the PARENT node ID from the index of the chosen item
				index);
		} else if(record.get('type') === car.mediaplayer.MediaNodeType.VIDEO) {
			// Node type is a video. Video playback is handled internally via HTML5 Video element, so
			// we'll fire an application event to play the video.
			this.onHide();
			this.getApplication().fireEvent('video_index');
			this.getApplication().fireEvent(MediaPlayer.enumeration.ApplicationEvent.CMD_PLAY_VIDEO, record);
		}
	},
	
	/**
	 * Instantiates a media menu and companion store and pushes the menu on to the menu stack.
	 * @param {String} mediaSourceId The media source ID to browse.
	 * @param {String} [mediaNodeId] The media node ID to browse.
	 * @private
	 */
	browseMedia: function(mediaSourceId, mediaNodeId) {
		// Create the media menu view
		var mediaNodeMenu = Ext.create('MediaPlayer.view.menu.MediaNode');
		
		// Create a new store for the menu and set the media source/node IDs on the proxy
		var browseStore = Ext.create('MediaPlayer.store.Browse');
		browseStore.setMediaSourceId(mediaSourceId);
		browseStore.setMediaNodeId(mediaNodeId);
		
		// Set the store
		mediaNodeMenu.child('menuList').setStore(browseStore);
		
		// Add the menu to the stack
		this.getMenuStack().push(mediaNodeMenu);

		// Load the first page
		browseStore.loadPage(1);
	},
	
	/**
	 * Creates a track session, starts playback immediately, and then shows the audio view.
	 * @param {Number} mediaSourceId The media source ID.
	 * @param {?String} mediaNodeId The media node ID, or null for the root node.
	 * @param {Number} index The track index to set as current after track session creation.
	 * @private
	 */
	playAudio: function(mediaSourceId, mediaNodeId, index) {
		// Node type is an audio file, so we'll build a track session and then play
		this.getApplication().fireEvent(MediaPlayer.enumeration.ApplicationEvent.CMD_CREATE_TRACK_SESSION,
				mediaSourceId,
				mediaNodeId,
				index);
		
		// Play
		this.getApplication().fireEvent(MediaPlayer.enumeration.ApplicationEvent.CMD_PLAY);
		
		// Hide the menu and switch to the audio view
		this.onHide();
		this.getApplication().fireEvent('audio_index');
	},
	
	/**
	 * Event handler triggered when an item is tapped on the radio sources menu
	 * @param dv {Object} The dataview containing the item
	 * @param index {Number} The index of the tapped item
	 * @param target {Object} The data item that was tapped
	 * @param record {Object} The RadioSource record associated with the item
	 * @private
	 */
	onRadioSourceItemTap: function(dv, index, target, record) {
		if(record.data.available == false)
		{
			if(record.data.id == 'pandora')
			{
				var loginDialog = this.getPandoraLoginDialog();
				Ext.Viewport.add(loginDialog);
				loginDialog.show();
			}
			else
			{
				Ext.Msg.alert('Warning', 'This radio source is not available yet.', Ext.emptyFn);
			}
		}
		else
		{
			// Show the radio view or sub-menu for the selected item
			if(record.data.id == 'am_fm')
			{
				this.onHide();
				this.getApplication().fireEvent('radiotuner_index');
			}
			else if(record.data.id == 'pandora')
			{
				this.getMenuStack().push(this.getPandoraStations());
			}
		}
	},
	
	/**
	 * Event handler triggered when an item is tapped on the Pandora stations menu
	 * @param dv {Object} The dataview containing the item
	 * @param index {Number} The index of the tapped item
	 * @param target {Object} The data item that was tapped
	 * @param record {Object} The PandoraStation record associated with the item
	 * @private
	 */
	onPandoraStationItemTap: function (dv, index, target, record) {
		this.onHide();
		this.getApplication().fireEvent('pandora_selectStation', { stationToken: record.data.stationToken });
	}
});
