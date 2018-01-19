/**
 * The controller responsible for the search screens
 * @author mlapierre
 *
 * $Id: Search.js 7377 2013-10-22 14:41:52Z nschultz@qnx.com $
 */
Ext.define('MediaPlayer.controller.Search', {
	extend: 'Ext.app.Controller',

	requires: [ 'MediaPlayer.enumeration.ApplicationEvent' ],
	
	config: {
		refs: {
			index: 'searchView',
			
			sources: 'searchSourceView',
			sourceList: 'searchSourceView menuList',

			search: { selector: 'searchSearchView', xtype: 'searchSearchView', autoCreate: true },
			searchButton: 'searchSearchView button[action=search]',
			searchText: 'searchSearchView textfield[name=searchterm]',
			searchResults: 'searchSearchView menuList',
		},
		control: {
			sourceList: { itemtap: 'onSourceListItemTap' },
			searchButton: { release: 'onSearchButtonTap' },
			searchResults: { itemtap: 'onSearchResultsItemTap' },
			searchText: { clearicontap: 'onSearchTextClearIconTap', keyup: 'onSearchTextKeyUp' },
		},
	},

	/**
	 * The media source ID selected in the sources view. This ID is used to identify which
	 * media source we're searching when the user submits a query.
	 * @private
	 */
	searchMediaSourceId: null,
	
	/**
	 * Initializes the controller on app startup.
	 */
	init: function() {
		this.getApplication().on({
			search_index: this.onSearchIndex,

			scope: this
		});
		
		// Attach update and delete handlers to the MediaSources store so that we can know when
		// to hide search menus if the media source is disabled or disappears
		Ext.getStore('SearchSources').on({
			updaterecord: this.onMediaSourceUpdated,
			removerecords: this.onMediaSourceRemoved,
			
			scope: this
		});
	},
	
	/**
	 * Method called when app is ready to launch.
	 */
	launch: function() {
	},
	
	/**
	 * Hides any sub-menus currently visible in the search menu stack.
	 */
	hideSubMenus: function() {
		// Only animate the hiding of sub-menus if the search menu stack is visible
		this.getIndex().hideAllSubMenus(!this.getIndex().isHidden());
		this.searchMediaSourceId = null;
	},
	
	/**
	 * Shows the search view and optionally performs a remote search operation if the event object
	 * contains a searchTerm and mediaSourceId argument.
	 * @param event {Object} The search_index event object.
	 * @private
	 */
	onSearchIndex: function(event) {
		// Set the main search view as the active viewport view
		Ext.Viewport.setActiveItem(this.getIndex());

		// Check if there are additional arguments in the event indicating that a remote search is being performed
		if (typeof event === 'object' && event !== null
				&& event.hasOwnProperty('mediaSourceId') && event.mediaSourceId !== null
				&& event.hasOwnProperty('searchTerm') && event.searchTerm !== null) {
			// Attempt to get the media source
			var mediaSource = Ext.getStore('SearchSources').findRecord('id', event.mediaSourceId);
			
			if(mediaSource) {
				// Select the media source and perform the search
				this.selectSearchSource(mediaSource);
				this.performSearch(event.searchTerm);
			} else {
				console.warn('MediaPlayer.controller.Search::onSearchIndex - Media source with ID ' + event.mediaSourceId +
						' could not be found.');
			}
		}
	},
	
	/**
	 * Method called when a media source is updated.
	 * @param {Ext.data.Store} store The store which fired the event.
	 * @param {Ext.data.Model} record The Model instance that was updated.
	 */
	onMediaSourceUpdated: function(store, record) {
		if (record.get('id') === this.searchMediaSourceId && record.get('ready') === false) {
			this.hideSubMenus();
		}
	},
	
	/**
	 * Method called when a media source is removed.
	 * @param {Ext.data.Store} store The store which fired the event.
	 * @param {Ext.data.Model[]} records The Model instances that were removed.
	 */
	onMediaSourceRemoved: function(store, records) {
		for(var i in Ext.Array.from(records)) {
			if(records[i].get('id') === this.searchMediaSourceId) {
				this.hideSubMenus();
				break;
			}
		}
	},
	
	/**
	 * Event handler triggered when an item is tapped on the sources list.
	 * @param dv {Object} The dataview containing the item
	 * @param index {Number} The index of the item tapped
	 * @param item {Object} The element or DataItem tapped
	 * @param record {Object} The record assosciated to the item
	 * @private
	 */
	onSourceListItemTap: function (dv, index, item, record) {
		this.selectSearchSource(record);
	},
	
	
	/**
	 * Selects a search media source and shows the search view.
	 * @param mediaSource {MediaPlayer.model.MediaSource} The media source to select as the active search source.
	 * @private
	 */
	selectSearchSource: function(mediaSource) {
		// Remove the search results since they're no longer valid
		Ext.getStore('SearchResults').removeAll();
			
		// Check if the new media source is ready
		if (mediaSource.get('ready')) {
			// Update the search source ID
			this.searchMediaSourceId = mediaSource.get('id');

			// Show the search view
			this.getIndex().push(this.getSearch());
			this.getSearchResults().setEmptyText(' ');
		} else {
			// Clear the current search source
			this.searchMediaSourceId = null;

			// Remove the search view from the stack if it's visible since we no longer have a valid search source
			this.hideSubMenus();
			
			console.warn('MediaPlayer.controller.Search::selectSearchSource - Media source with ID ' + mediaSource.get('id') +
					' is not ready.');
		}
	},
	
	/**
	 * Event handler triggered when the search button is pressed.
	 * @private
	 */
	onSearchButtonTap: function() {
		var searchTerm = this.getSearchText().getValue();
		
		this.performSearch(searchTerm);
	},
	
	/**
	 * Performs a search against the current search source.
	 * @param searchTerm {String} The search term.
	 */
	performSearch: function(searchTerm) {
		if(this.searchMediaSourceId !== null) {
			if(searchTerm.trim()) {
				this.getSearchText().setValue(searchTerm.trim());
				
				var searchResults = Ext.getStore('SearchResults');
				
				searchResults.removeAll();
				searchResults.setMediaSourceId(this.searchMediaSourceId);
				searchResults.setMediaNodeId(null);	// Search from the root of the media source
				searchResults.setSearchTerm(searchTerm);
				
				searchResults.on('load', function(store, records, successful, operation, eOpts) {
					if (records.length == 0) {
						this.getSearchResults().setEmptyText('No search results.');
					}
				}, this, { single: true });
				searchResults.loadPage(1);
			}
		} else {
			console.error('MediaPlayer.controller.Search::performSearch - Cannot perform search without first selecting ' + 
					'a search media source.');
		}
	},
	
	/**
	 * Method called when the clear icon is tapped 
	 */
	onSearchTextClearIconTap: function() {
		Ext.getStore('SearchResults').removeAll();
	},
	
	/**
	 * Method fired when a character is entered into the text field
	 * @param textfield {Object} The textfield that received the event
	 * @param e {Object} The keyup event
	 * @param opts {Object} The options object passed to Ext.util.Observable.addListener 
	 */
	onSearchTextKeyUp: function(textfield, e, opts) {
		//check for return character (13) and execute search
		if (e.event.keyCode == 13){
			this.onSearchButtonTap();
		}
	},
	
	/**
	 * Event handler triggered when an item is tapped on the search results list
	 * @param dv {Object} The dataview containing the item
	 * @param index {Number} The index of the item tapped
	 * @param item {Object} The element or DataItem tapped
	 * @param record {Object} The record assosciated to the item
	 * @param e {Object} The event object
	 * @param opts {Object} The options object passed to Ext.util.Observable.addListener
	 */
	onSearchResultsItemTap: function (dv, index, item, record, e, opts) {
		if(record.get('type') === car.mediaplayer.MediaNodeType.FOLDER
				|| record.get('type') === car.mediaplayer.MediaNodeType.AUDIO) {
			this.getApplication().fireEvent(MediaPlayer.enumeration.ApplicationEvent.CMD_CREATE_TRACK_SESSION,
					record.get('mediaSourceId'),
					record.get('id'),	// Create a track session from the chosen node
					0);					// At index 0 (first child track)
			this.getApplication().fireEvent(MediaPlayer.enumeration.ApplicationEvent.CMD_PLAY);
			
			// Switch to the audio view
			this.getApplication().fireEvent('audio_index');
		} else if(record.get('type') === car.mediaplayer.MediaNodeType.VIDEO) {
			// Node type is a video. Video playback is handled internally via HTML5 Video element, so
			// we'll fire an application event to play the video.
			this.getApplication().fireEvent('video_index');
			this.getApplication().fireEvent(MediaPlayer.enumeration.ApplicationEvent.CMD_PLAY_VIDEO, record);

			// Switch to the video view
			this.getApplication().fireEvent('video_index');
		}		
	}
});
