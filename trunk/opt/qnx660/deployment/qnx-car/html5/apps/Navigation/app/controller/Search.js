/**
 * The controller responsible for the search screens
 * @author mlapierre
 *
 * $Id: Search.js 7045 2013-08-28 19:21:59Z nschultz@qnx.com $
 */
Ext.define('Navigation.controller.Search', {
	extend: 'Ext.app.Controller',

	config: {
		refs: {
			search: 'search',
			
			searchType: 'searchType',
			poiSearch:		{ selector: 'searchPoi',	xtype: 'searchPoi',		autoCreate: true },
			citySearch:		{ selector: 'searchCity',	xtype: 'searchCity',	autoCreate: true },
			streetSearch:	{ selector: 'searchStreet',	xtype: 'searchStreet',	autoCreate: true },
			numberSearch:	{ selector: 'searchNumber',	xtype: 'searchNumber',	autoCreate: true },
			addressSearch:  { selector: 'searchAddress', xtype: 'searchAddress', autoCreate: true },

			searchTypeList: 'searchType menuList',
			
			poiSearchButton: 'searchPoi button[action=search]',
			poiSearchText: 'searchPoi textfield[name=searchterm]',
			poiSearchResultList: 'searchPoi menuList',

			citySearchButton: 'searchCity button[action=search]',
			citySearchText: 'searchCity textfield[name=searchterm]',
			citySearchResultList: 'searchCity menuList',
			
			streetSearchButton: 'searchStreet button[action=search]',
			streetSearchText: 'searchStreet textfield[name=searchterm]',
			streetSearchResultList: 'searchStreet menuList',

			numberSearchButton: 'searchNumber button[action=search]',
			numberSearchText: 'searchNumber textfield[name=searchterm]',
			numberSearchResultList: 'searchNumber menuList',

			addressSearchTitle: '#address-search-title',
			addressSearchResultsList: 'searchAddress menuList',
		},
		control: {
			searchTypeList: { itemtap: 'onSearchTypeListItemTap' },

			poiSearchButton: { release: 'onPoiSearchButtonTap' },
			poiSearchText: { clearicontap: function() { Ext.getStore('PoiResults').removeAll(); }},
			poiSearchResultList: { itemtap: 'onPoiSearchResultsItemTap' },
			
			citySearchButton: { release: 'onCitySearchButtonTap' },
			citySearchText: { clearicontap: function() { Ext.getStore('CityResults').removeAll(); }},
			citySearchResultList: { itemtap: 'onCitySearchResultsItemTap' },
			
			streetSearchText: { clearicontap: function() { Ext.getStore('StreetResults').removeAll(); }},
			streetSearchButton: { release: 'onStreetSearchButtonTap' },
			streetSearchResultList: { itemtap: 'onStreetSearchResultsItemTap' },

			numberSearchText: { clearicontap: function() { Ext.getStore('NumberResults').removeAll(); }},
			numberSearchButton: { release: 'onNumberSearchButtonTap' },
			numberSearchResultList: { itemtap: 'onNumberSearchResultsItemTap' },

			addressSearchResultsList: { itemtap: 'onAddressSearchResultsItemTap'},
		},
		location: null,
		unexpectedPoiSearch: false,
	},

	// an enumeration containing the search id
	SEARCH_IDS: {
		CITY: 'city',
		STREET: 'street',
		NUMBER: 'number',
		POI: 'poi',
		ADDRESS: 'address',
	},

	/**
	 * Initializes the controller on app startup
	 */
	init: function() {
		this.getApplication().on({
			search_index: this.onSearchIndex,
			scope: this
		});
	},
	
	/**
	 * Method called when app is ready to launch
	 */
	launch: function() {
		//auto detect webworks vs cordova
		if (typeof blackberry == 'object') {
			blackberry.event.addEventListener('resume', this.onResume.bind(this));
		} else {
			document.addEventListener('resume', this.onResume.bind(this));
		}
	},

	/**
	 * Method called when the application receives a resume event
	 */
	onResume: function(e) {
		//check for args
		if (e && e.action) {
			switch (e.action) {
				case 'poisearch': 
					//show the search view
					this.onSearchIndex();

					// Hide the main menu
					this.getApplication().fireEvent('menu_hide');

					// Hide any menus which may have already been shown
					this.getSearch().hideAllSubMenus(false);
					
					//show the poi search view
					this.getSearch().push(this.getPoiSearch());

					//put the search term in the search bar
					if (e.search_term) {
						this.getPoiSearchText().setValue(e.search_term);
					}

					//execute the search
					this.onPoiSearchButtonTap();
					break;

				case 'addresssearch':
					//clear the previous results
					Ext.getStore('AddressResults').removeAll();

					//show the search view
					this.onSearchIndex();

					// Hide any menus which may have already been shown
					this.getSearch().hideAllSubMenus(false);
					
					//show the poi search view
					this.getSearch().push(this.getAddressSearch());

					if (e.location) {
						var addressString = e.location.number + " " + e.location.street + " " + e.location.city + " " + e.location.province;
						this.getAddressSearchTitle().setHtml('Searching for: ' + addressString);
					}

					car.navigation.searchAddress(e.location, function(locations) {
						Ext.getStore('AddressResults').removeAll();
						Ext.getStore('AddressResults').add(locations);
						Ext.getStore('AddressResults').load();
					}.bind(this));

					//execute the search
					break;

				default:
					console.error('[controller] Search :: onResume :: Invalid action; action=' + e.action);
			}
		}
	},

	/**
	 * Shows the search view
	 */
	onSearchIndex: function() {
		Ext.Viewport.setActiveItem(this.getSearch());
	},

	/**
	 * Event handler triggered when an item is tapped on the search type list
	 * @param dv {Object} Ext.dataview.DataView
	 * @param index {Number} The index of the item tapped
	 * @param target {Object} The element or DataItem tapped
	 * @param record {Object} The record associated to the item
	 * @param e {Object} The event object
	 * @param eOpts {Object} The options object passed to Ext.util.Observable.addListener
	 */
	onSearchTypeListItemTap: function(dv, index, target, record, e, eOpts) {
		//clear all the search stores
		Ext.getStore('CityResults').removeAll();
		Ext.getStore('StreetResults').removeAll();
		Ext.getStore('NumberResults').removeAll();
		Ext.getStore('PoiResults').removeAll();
		Ext.getStore('AddressResults').removeAll();

		//show the proper search page
		switch (record.get('value')) {
			case 'address':
				this.getSearch().push(this.getCitySearch());
				break;

			case 'poi':
				this.getSearch().push(this.getPoiSearch());
				break;

			default:
				console.error('[controller] Search :: onSearchTypeListItemTap :: Invalid type value; value=' + record.get('value'));
		}
	},

	/**
	 * Performs a poi search by name
	 */
	onPoiSearchButtonTap: function() {
		var searchterm = this.getPoiSearchText().getValue();
		Ext.getStore('PoiResults').removeAll();
		
		if (searchterm && searchterm.length > 0) {
			this.getPoiSearchButton().disable();
			car.navigation.searchPOI(searchterm, function(locations) {
				Ext.getStore('PoiResults').add(locations);
				Ext.getStore('PoiResults').load();
				this.getPoiSearchButton().enable();
			}.bind(this));
		}
	},
	
	/**
	 * Event handler triggered when an item is tapped in the POI search results list
	 * @param dv {Object} Ext.dataview.DataView
	 * @param index {Number} The index of the item tapped
	 * @param target {Object} The element or DataItem tapped
	 * @param record {Object} The record associated to the item
	 * @param e {Object} The event object
	 * @param eOpts {Object} The options object passed to Ext.util.Observable.addListener
	 */
	onPoiSearchResultsItemTap: function(dv, index, target, record, e, eOpts) {
		this.getApplication().fireEvent('map_index', { routing: true });
		car.navigation.navigateTo(record.getData(), null, this.onNavigationError.bind(this));
	},

	/**
	 * Event handler triggered when an item is tapped in the address search results list
	 * @param dv {Object} Ext.dataview.DataView
	 * @param index {Number} The index of the item tapped
	 * @param target {Object} The element or DataItem tapped
	 * @param record {Object} The record associated to the item
	 * @param e {Object} The event object
	 * @param eOpts {Object} The options object passed to Ext.util.Observable.addListener
	 */
	onAddressSearchResultsItemTap: function(dv, index, target, record, e, eOpts) {
		this.getApplication().fireEvent('map_index', { routing: true });
		car.navigation.navigateTo(record.getData(), null, this.onNavigationError.bind(this));
	},
	
	/**
	 * Performs a city search
	 */
	onCitySearchButtonTap: function() {
		var searchterm = this.getCitySearchText().getValue();
		Ext.getStore('CityResults').removeAll();
		
		if (searchterm && searchterm.length > 0) {
			this.getCitySearchButton().disable();
			car.navigation.searchAddress({ city: searchterm }, function(locations) {
				Ext.getStore('CityResults').add(locations);
				Ext.getStore('CityResults').load();
				this.getCitySearchButton().enable();
			}.bind(this));
		}
	},
	
	/**
	 * Event handler triggered when an item is tapped on the Main menu
	 * @param dv The dataview containing the item
	 * @param index The index of the tapped item
	 * @param item The item that was tapped
	 * @param e The triggered event
	 */
	onCitySearchResultsItemTap: function(dv, index, item, e) {
		var record = Ext.getStore('CityResults').getAt(index);
		this.setLocation(record.getData());
		Ext.getStore('StreetResults').removeAll();
		this.getSearch().push(this.getStreetSearch());
	},

	/**
	 * Performs a street search
	 */
	onStreetSearchButtonTap: function() {
		var searchterm = this.getStreetSearchText().getValue();
		Ext.getStore('StreetResults').removeAll();
		
		if (searchterm && searchterm.length > 0) {
			this.getStreetSearchButton().disable();
			
			var location = this.getLocation();
			car.navigation.searchAddress({ 
				country: location.country,
				city: location.city,
				street: searchterm,
			}, function(locations) {
				Ext.getStore('StreetResults').add(locations);
				Ext.getStore('StreetResults').load();
				this.getStreetSearchButton().enable();
			}.bind(this));
		}
	},
	
	/**
	 * Event handler triggered when an item is tapped on the Main menu
	 * @param dv The dataview containing the item
	 * @param index The index of the tapped item
	 * @param item The item that was tapped
	 * @param e The triggered event
	 */
	onStreetSearchResultsItemTap: function(dv, index, item, e) {
		var record = Ext.getStore('StreetResults').getAt(index);
		this.setLocation(record.getData());
		Ext.getStore('NumberResults').removeAll();
		this.getSearch().push(this.getNumberSearch());
	},

	/**
	 * Performs a number search
	 */
	onNumberSearchButtonTap: function() {
		var searchterm = this.getNumberSearchText().getValue();
		Ext.getStore('NumberResults').removeAll();
		
		if (searchterm && searchterm.length > 0) {
			this.getNumberSearchButton().disable();
			
			var location = this.getLocation();
			car.navigation.searchAddress({ 
				country: location.country,
				city: location.city,
				street: location.street,
				number: searchterm
			}, function(locations) {
				Ext.getStore('NumberResults').add(locations);
				Ext.getStore('NumberResults').load();
				this.getNumberSearchButton().enable();
			}.bind(this));
		}
	},
	
	/**
	 * Event handler triggered when an item is tapped on the Main menu
	 * @param dv The dataview containing the item
	 * @param index The index of the tapped item
	 * @param item The item that was tapped
	 * @param e The triggered event
	 */
	onNumberSearchResultsItemTap: function(dv, index, item, e) {
		var record = Ext.getStore('NumberResults').getAt(index);
		this.getApplication().fireEvent('map_index', { routing: true });
		car.navigation.navigateTo(record.getData(), null, this.onNavigationError.bind(this));
	},


	/**
	 * Callback methods to use if there is an error on a navigateTo call
	 * @param event {Object} The event object
	 */
	onNavigationError: function(error) {
		this.getApplication().fireEvent('navigation_error', error);
	},

});
