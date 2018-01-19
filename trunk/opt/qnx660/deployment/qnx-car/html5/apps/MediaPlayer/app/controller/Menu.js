/**
 * The controller responsible for the menu.
 * @author mlapierre
 *
 * $Id: Menu.js 5856 2013-02-28 19:58:52Z lgreenway@qnx.com $
 */

//FIXME: 	This is a hack to get around the inability to 
//			pass through the menu controller's browsingSource
//			to the xtemplate rendering the menu rows. 
var browsingSource = null;
var browsingType = null;
var browsingTypeId = null;

Ext.define('MediaPlayer.controller.Menu', {
	extend: 'Ext.app.Controller',

	requires: [
		'MediaPlayer.view.radio.pandora.LoginDialog',
	],

	config:{
		refs: {
			mainMenu			: 'menuView',
			
			menuStack			: 'menuView > stackedMenu',
			
			browseBy			: { selector: 'menuBrowseByView',			xtype: 'menuBrowseByView',			autoCreate: true},
			songs				: { selector: 'menuSongsView',				xtype: 'menuSongsView',				autoCreate: true },
			artists				: { selector: 'menuArtistsView',			xtype: 'menuArtistsView',			autoCreate: true },
			albums				: { selector: 'menuAlbumsView',				xtype: 'menuAlbumsView',			autoCreate: true },
			genres				: { selector: 'menuGenresView',				xtype: 'menuGenresView',			autoCreate: true },
			videos				: { selector: 'menuVideosView',				xtype: 'menuVideosView',			autoCreate: true },
			playlists			: { selector: 'menuPlaylistsView',			xtype: 'menuPlaylistsView',			autoCreate: true },
			radioSources		: { selector: 'menuRadioSourcesView',		xtype: 'menuRadioSourcesView',		autoCreate: true },
			pandoraStations		: { selector: 'menuPandoraStationsView',	xtype: 'menuPandoraStationsView',	autoCreate: true },
			
			pandoraLoginDialog	: { selector: 'pandoraLoginDialog', xtype: 'pandoraLoginDialog', autoCreate: true },
		 },
		control: {
			'menuMain > list': {
				itemtap: 'onMainMenuItemTap'
			},
			'menuBrowseByView > list': {
				itemtap: 'onBrowseByItemTap'
			},
			'menuSongsView > list': {
				itemtap: 'onSongsItemTap'
			},
			'menuArtistsView > list': {
				itemtap: 'onArtistsItemTap'
			},
			'menuAlbumsView > list': {
				itemtap: 'onAlbumsItemTap'
			},
			'menuGenresView > list': {
				itemtap: 'onGenresItemTap'
			},
			'menuVideosView > list': {
				itemtap: 'onVideosItemTap'
			},
			'menuRadioSourcesView > list': {
				itemtap: 'onRadioSourceItemTap'
			},
			'menuPandoraStationsView > list': {
				itemtap: 'onPandoraStationItemTap'
			},
			'menuPlaylistsView > list':{
				itemtap: 'onPlaylistsItemTap'
			},
		},
		lastArtistId: 0,
	},

	/**
	 * Initializes the controller on app startup
	 */
	init: function() {
		this.getApplication().on({
			menu_show			: this.onShow,
			menu_hide			: this.onHide,
			home_index			: this.onHide,
			pandora_index		: this.onHide,
			submenu_hide		: this.onSubHide,
			mediasource_removed	: this.onMediaSourceRemoved,
			scope: this
		});
	},
	
	/**
	 * Method called when app is ready to launch
	 */
	launch: function() {		
		var sources = qnx.mediasource.get();
		var sourcesArray = [];
		for (var key in sources) {
			sourcesArray.push(sources[key]);
		}
		Ext.getStore('MediaSources').add(sourcesArray);
		browsingSource = sourcesArray[0];
		
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
	 * Method called when we want to show the menu
	 */
	onShow: function() {
		//show the menu
		Ext.getStore('MediaSources').clearFilter();
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
	onSubHide: function() {
		this.getMenuStack().hideAllSubMenus();
	},
	
	/**
	 * Method called when a media source is removed
	 * @param e {Object} The event details
	 */
	onMediaSourceRemoved: function(e) {
		if (browsingSource && e.id == browsingSource.id) {
			this.getApplication().fireEvent('submenu_hide');
		}
	},
	
	/**
	 * Event handler triggered when an item is tapped on the Main menu
	 * @param dv {Object} The dataview containing the item
	 * @param index {Number} The index of the tapped item
	 * @param item {Object} The item that was tapped
	 * @param e {Object} The triggered event
	 */
	onMainMenuItemTap: function (dv, index, item, e) {
		browsingSource = Ext.getStore('MediaSources').getAt(index).data;
		if (!browsingSource.synched) {
			Ext.Msg.alert('Warning', 'This media source is not ready yet.', Ext.emptyFn);
			return;
		}

		if (browsingSource.type == "radio") {
			this.getMenuStack().push(this.getRadioSources());
		} else {
			this.getMenuStack().push(this.getBrowseBy());
		}
	},
	
	/**
	 * Event handler triggered when an item is tapped on the Browse By menu
	 * @param dv {Object} The dataview containing the item
	 * @param index {Number} The index of the tapped item
	 * @param item {Object} The item that was tapped
	 * @param e {Object} The triggered event
	 */
	onBrowseByItemTap: function (dv, index, item, e) {
		var selected = Ext.getStore('BrowseBy').getAt(index);
		switch (selected.get('type')) {
			case 'song':
				Ext.getStore('Songs').removeAll();
				Ext.getStore('Songs').add(qnx.medialibrary.getAllSongs(browsingSource));
				this.getMenuStack().push(this.getSongs());
				browsingType = 'fid';
				break;
				
			case 'artist':
				Ext.getStore('Artists').removeAll();
				Ext.getStore('Artists').add(qnx.medialibrary.getArtists(browsingSource));
				this.getMenuStack().push(this.getArtists());
				browsingType = 'album';
				//THIS IS NOT A BUG! When browsing by artist we show the albums on the next screen
				//Planning an 'all' option for A4   
				break;
				
			case 'album': 
				Ext.getStore('Albums').removeAll();
				Ext.getStore('Albums').add(qnx.medialibrary.getAlbums(browsingSource));
				this.getMenuStack().push(this.getAlbums());
				browsingType = 'album';
				break;

			case 'genre': 
				Ext.getStore('Genres').removeAll();
				Ext.getStore('Genres').add(qnx.medialibrary.getGenres(browsingSource));
				this.getMenuStack().push(this.getGenres());
				browsingType = 'genre';
				break;
			
			case 'video': 
				Ext.getStore('Videos').removeAll();
				Ext.getStore('Videos').add(qnx.medialibrary.getVideos(browsingSource));
				this.getMenuStack().push(this.getVideos());
				break;
				
			case 'playlist':
				Ext.getStore('Playlists').removeAll();
				//Ext.getStore('Playlists').add(qnx.medialibrary.getPlaylists(browsingSource));
				this.getMenuStack().push(this.getPlaylists());
				break;

			default: 
				console.log('onBrowseByItemTap: unknown menu item action:' + selected.get('type'));
				break;
		}
	},
	
	/**
	 * Event handler triggered when an item is tapped on the Songs menu
	 * @param dv {Object} The dataview containing the item
	 * @param index {Number} The index of the tapped item
	 * @param item {Object} The item that was tapped
	 * @param e {Object} The triggered event
	 */
	onSongsItemTap: function (dv, index, item, e) {
		this.onHide();
		this.getApplication().fireEvent('audio_play', { 
			data: {
				index: index, 
				source: browsingSource, 
				type: browsingType,
				id: browsingTypeId,
			}
		});
	},
	
	/**
	 * Event handler triggered when an item is tapped on the Artists menu
	 * @param dv {Object} The dataview containing the item
	 * @param index {Number} The index of the tapped item
	 * @param item {Object} The item that was tapped
	 * @param e {Object} The triggered event
	 */
	onArtistsItemTap: function (dv, index, item, e) {	
		var artist = Ext.getStore('Artists').getAt(index);
		Ext.getStore('Albums').removeAll();
		Ext.getStore('Albums').add(qnx.medialibrary.getArtistAlbums(browsingSource,artist.get('id')));
		this.getMenuStack().push(this.getAlbums());
		browsingTypeId = artist.get('id');
		this.setLastArtistId(browsingTypeId);
	},

	/**
	 * Event handler triggered when an item is tapped on the Albums menu
	 * @param dv {Object} The dataview containing the item
	 * @param index {Number} The index of the tapped item
	 * @param item {Object} The item that was tapped
	 * @param e {Object} The triggered event
	 */
	onAlbumsItemTap: function (dv, index, item, e) {		
		var album = Ext.getStore('Albums').getAt(index);
		Ext.getStore('Songs').removeAll();

		//determine if we must also filter by artist.
		// if (this.getArtists().isHidden()) {
			//artist sheet is not displayed, we are browsing just by album
			Ext.getStore('Songs').add(qnx.medialibrary.getAlbumSongs(browsingSource,album.get('id')));
		// } else {
			//artist sheet is  displayed, we are browsing by artist/album
			// Ext.getStore('Songs').add(qnx.medialibrary.getArtistAlbumSongs(browsingSource, this.getLastArtistId(), album.get('id')));
		// }
									
		this.getMenuStack().push(this.getSongs());
		browsingTypeId = album.get('id');
	},
	
	/**
	 * Event handler triggered when an item is tapped on the Genres menu
	 * @param dv {Object} The dataview containing the item
	 * @param index {Number} The index of the tapped item
	 * @param item {Object} The item that was tapped
	 * @param e {Object} The triggered event
	 */
	onGenresItemTap: function (dv, index, item, e) {		
		var genre = Ext.getStore('Genres').getAt(index);
		Ext.getStore('Songs').removeAll();
		Ext.getStore('Songs').add(qnx.medialibrary.getGenreSongs(browsingSource,genre.get('id')));
		this.getMenuStack().push(this.getSongs());
		browsingTypeId = genre.get('id');
	},
	
	/**
	 * Event handler triggered when an item is tapped on the Videos menu
	 * @param dv {Object} The dataview containing the item
	 * @param index {Number} The index of the tapped item
	 * @param target {Object} The data item that was tapped
	 * @param record {Object} The Video record associated with the item
	 */
	onVideosItemTap: function (dv, index, target, record) {
		Ext.getStore('VideoPlaylist').removeAll();
		Ext.getStore('VideoPlaylist').add(Ext.getStore('Videos').getRange());
		
		this.onHide();
		this.getApplication().fireEvent('video_play', {
			data: {
				index: index, 
				source: browsingSource, 
			}
		});
	},
	
	/**
	 * Event handler triggered when an item is tapped on the radio sources menu
	 * @param dv {Object} The dataview containing the item
	 * @param index {Number} The index of the tapped item
	 * @param target {Object} The data item that was tapped
	 * @param record {Object} The RadioSource record associated with the item
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
	 */
	onPandoraStationItemTap: function (dv, index, target, record) {
		this.onHide();
		this.getApplication().fireEvent('pandora_selectStation', { stationToken: record.data.stationToken });
	},
	
	/**
	 * Event handler triggered when an item is tapped on the Pandora stations menu
	 * @param dv {Object} The dataview containing the item
	 * @param index {Number} The index of the tapped item
	 * @param target {Object} The data item that was tapped
	 * @param record {Object} The Playlist record associated with the item
	 */
	
	onPlaylistItemsTap: function (dv, index, target, record){
		this.onHide();
	},
});
