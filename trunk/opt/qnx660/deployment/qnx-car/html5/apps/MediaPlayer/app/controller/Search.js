/**
 * The controller responsible for the search screens
 * @author mlapierre
 *
 * $Id: Search.js 5944 2013-03-26 14:40:57Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.controller.Search', {
	extend: 'Ext.app.Controller',

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
	 * Initializes the controller on app startup
	 */
	init: function() {
		this.getApplication().on({
			search_index: this.onSearchIndex,
			mediasource_removed	: this.onMediaSourceRemoved,
			scope: this
		});
		
		this.searchFilter = Ext.create('Ext.util.Filter', {
			root: 'data',
			filterFn: function(record) {
				switch (record.get('id')) {
					case 'radio':
						return false;
						break;
					
					default: 
						return true;
				}
			}
		});
	},
	
	/**
	 * Method called when app is ready to launch
	 */
	launch: function() {
	},
	
	/**
	 * Shows the search view
	 */
	onSearchIndex: function() {
		Ext.getStore('MediaSources').filter(this.searchFilter);

		// Hide all sub-menus immediately
		this.getIndex().hideAllSubMenus(false);
		
		Ext.Viewport.setActiveItem(this.getIndex());
	},
	
	/**
	 * Event handler triggered when an item is tapped on the sources list
	 * @param dv {Object} The dataview containing the item
	 * @param index {Number} The index of the item tapped
	 * @param item {Object} The element or DataItem tapped
	 * @param record {Object} The record assosciated to the item
	 * @param e {Object} The event object
	 * @param opts {Object} The options object passed to Ext.util.Observable.addListener
	 */
	onSourceListItemTap: function (dv, index, item, record, e, opts) {
		if (record.get('synched')) {
			this.searchSource = record.data;
			Ext.getStore('SearchResults').removeAll();
			
			// Show the search view
			this.getIndex().push(this.getSearch());
		}
	},
	
	/**
	 * Performs a search
	 */
	onSearchButtonTap: function() {
		var searchterm = this.getSearchText().getValue();
		Ext.getStore('SearchResults').removeAll();
		if (searchterm && searchterm.length > 0) {
			var results = qnx.medialibrary.search(this.searchSource,searchterm);
			if (results && results.length > 0) {
				Ext.getStore('SearchResults').add(results);
			} else {
				Ext.Msg.alert('Search', 'No search results found', Ext.emptyFn);
			}
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
	 * Event handler triggered when an item is tapped on the searchg results list
	 * @param dv {Object} The dataview containing the item
	 * @param index {Number} The index of the item tapped
	 * @param item {Object} The element or DataItem tapped
	 * @param record {Object} The record assosciated to the item
	 * @param e {Object} The event object
	 * @param opts {Object} The options object passed to Ext.util.Observable.addListener
	 */
	onSearchResultsItemTap: function (dv, index, item, record, e, opts) {
		this.getApplication().fireEvent('audio_play', {
			data: {
				type: record.get('type').replace(/song/, 'fid'),
				id: record.get('dbId'),
				source: this.searchSource,
			}
		});
	},
	
	/**
	 * Method called when a media source is added or removed
	 * @param e {Object} The event details
	 */
	onMediaSourceRemoved: function(e) {
		if (this.searchSource && e.id == this.searchSource.id) {
			this.getIndex().hideAllSubMenus();
		}
	},
});
