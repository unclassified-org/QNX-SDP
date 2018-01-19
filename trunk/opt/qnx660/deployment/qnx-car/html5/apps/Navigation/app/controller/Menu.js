/**
 * The controller responsible for the media player landing page.
 * @author mlapierre
 *
 * $Id: Menu.js 6967 2013-08-13 14:34:34Z mlapierre@qnx.com $
 */
Ext.define('Navigation.controller.Menu', {
	extend:'Ext.app.Controller',
	
	config: {
		refs: {
			mainMenu: 'menuView',
			
			menuStack: 'menuView > stackedMenu',
			
			menuShowButton: 'menuShowButton',
			
			favourites:			{ selector: 'menuFavourites',		xtype: 'menuFavourites',		autoCreate: true },
			history:			{ selector: 'menuHistory',			xtype: 'menuHistory',			autoCreate: true },
			settings:			{ selector: 'menuSettings',			xtype: 'menuSettings',			autoCreate: true },
			
			settingsRoute:		{ selector: 'menuSettingsRoute',	xtype: 'menuSettingsRoute',		autoCreate: true },
			settingsLanguage: 	{ selector: 'menuSettingsLanguage', xtype: 'menuSettingsLanguage',	autoCreate: true },
			settingsMap:		{ selector: 'menuSettingsMap',		xtype: 'menuSettingsMap',		autoCreate: true },
			settingsUnits:		{ selector: 'menuSettingsUnits',	xtype: 'menuSettingsUnits',		autoCreate: true },
			
			poiCategories:		{ selector: 'menuPoiCategories',	xtype: 'menuPoiCategories',		autoCreate: true },
			poiSubCategories:	{ selector: 'menuPoiSubCategories',	xtype: 'menuPoiSubCategories',	autoCreate: true },
			poiLocations:		{ selector: 'menuPoiLocations',		xtype: 'menuPoiLocations',		autoCreate: true },

			favouritesAdd:		{ selector: 'menuFavouritesAdd',	xtype: 'menuFavouritesAdd',		autoCreate: true },
		},
		control: {
			'menuMain > list': {
				itemtap: 'onMainMenuItemTap'
			},
			'menuSettings > list':{
				itemtap: 'onSettingsItemTap'
			},
			'menuPoiCategories > list': {
				itemtap: 'onPoiCategoriesItemTap'
			},
			'menuPoiSubCategories > list': {
				itemtap: 'onPoiSubCategoriesItemTap'
			},
			'menuFavourites list': {
				itemtap: 'onFavouritesListItemTap',
				itemtaphold: 'onFavouritesListItemTapHold',
			},
			'menuHistory list': {
				itemtap: 'onHistoryListItemTap',
			},
			'menuPoiLocations list': {
				itemtap: 'onPoiLocationsListItemTap',
			},
			'menuHistory button[action=clear-history]': {
				release: function() {
					car.navigation.clearHistory();
					Ext.getStore('History').removeAll();
				}
			},
			'menuFavourites button[action=add-favourite]': {
				release: function() {
					this.getMenuStack().push(this.getFavouritesAdd());
				}
			},
			'menuFavouritesAdd list': {
				itemtap: 'onFavouritesAddListItemTap',
			},
		},
	},

	/**
	 * Initializes the controller on app startup
	 */
	init: function() {
		this.getApplication().on({
			menu_show: 			this.onShow,
			menu_hide: 			this.onHide,
			history_index: 		this.onHistoryIndex,
			favourites_index: 	this.onFavouritesIndex,
			settings_index: 	this.onSettingsIndex,
			poi_index: 			this.onPoiIndex,
			scope: this
		});

		this.mainMenuStore = Ext.getStore('MainMenu');
		this.settingsMenuStore = Ext.getStore('SettingsMenu');
		this.poiCategoriesStore = Ext.getStore('PoiCategories');
		this.poiSubCategoriesStore = Ext.getStore('PoiSubCategories');
		this.poiLocationsStore = Ext.getStore('PoiLocations');
		
		//auto detect webworks vs cordova
		if (typeof blackberry == 'object') {
			blackberry.event.addEventListener('reselect', this.onHide.bind(this));
		} else {
			document.addEventListener('reselect', this.onHide.bind(this));
		}
	},

	/**
	 * Method called when app is ready to launch
	 */
	launch: function() {
 		//add swipe listener for hide buttons
		var hideButtons = Ext.ComponentQuery.query("menuHideButton");
		for (var i = 0; i < hideButtons.length; i++) {
			hideButtons[i].element.on({
				touchstart:function () {
					this.getApplication().fireEvent('menu_hide');
				},
				scope:this
			});
		}

		//add swipe listener for show buttons
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
		this.getMainMenu().show();
	},

	/**
	 * Method called when we want to hide the menu
	 */
	onHide: function() {
		this.getMainMenu().hide();
	},

	/**
	 * Quick link to the history menu
	 */
	onHistoryIndex: function() {
		this.getMenuStack().hideAllSubMenus(false);		
		this.getMenuStack().push(this.getHistory());
		this.onShow();
	},

	/**
	 * Quick link to the Favourites menu
	 */
	onFavouritesIndex: function() {
		this.getMenuStack().hideAllSubMenus(false);
		this.getMenuStack().push(this.getFavourites());
		this.onShow();
	},
	
	/**
	 * Quick link to the Settings menu
	 */
	onSettingsIndex: function() {
		this.getMenuStack().hideAllSubMenus(false);
		this.getMenuStack().push(this.getSettings());
		this.onShow();
	},
	
	/**
	 * Quick link to the POI menu
	 */
	onPoiIndex: function() {
		this.getMenuStack().hideAllSubMenus(false);
		this.getMenuStack().push(this.getPoiCategories());
		this.onShow();
	},
	
	/**
	 * Event handler triggered when an item is tapped on the Main menu
	 * @param dv The dataview containing the item
	 * @param index The index of the tapped item
	 * @param item The item that was tapped
	 * @param e The triggered event
	 */
	onMainMenuItemTap: function(dv, index, item, e) {
		var record = this.mainMenuStore.getAt(index);
		switch (record.get('type')) {
			case 'poi':
				this.getMenuStack().push(this.getPoiCategories());
				break;

			case 'favourites':
				this.getMenuStack().push(this.getFavourites());
				break;

			case 'history':
				this.getMenuStack().push(this.getHistory());
				break;

			case 'settings':
				this.getMenuStack().push(this.getSettings());
				break;

			case 'search':
				this.onHide();
				this.getApplication().fireEvent('search_index');
				break;

			case 'map':
				this.onHide();
				this.getApplication().fireEvent('map_index');
				break;

			default:
				break;
		}
	},
	
	/**
	 * Event handler triggered when an item is tapped on the Settings menu
	 * @param dv The dataview containing the item
	 * @param index The index of the tapped item
	 * @param item The item that was tapped
	 * @param e The triggered event
	 */
	onSettingsItemTap: function(dv, index, item, e) {
		var record = this.settingsMenuStore.getAt(index);
		switch (record.get('type')) {
			case 'route':
				this.getMenuStack().push(this.getSettingsRoute());
				break;
				
			case 'language':
				this.getMenuStack().push(this.getSettingsLanguage());
				break;

			case 'map':
				this.getMenuStack().push(this.getSettingsMap());
				break;

			case 'units':
				this.getMenuStack().push(this.getSettingsUnits());
				break;

			default:
				break;
		}
	},
	
	/**
	 * Event handler triggered when an item is tapped on the POI Categories menu
	 * @param dv The dataview containing the item
	 * @param index The index of the tapped item
	 * @param item The item that was tapped
	 * @param e The triggered event
	 */
	onPoiCategoriesItemTap: function(dv, index, item, e) {
		var record = this.poiCategoriesStore.getAt(index);
		this.poiSubCategoriesStore.removeAll();
		this.poiSubCategoriesStore.getProxy().setCategoryId(record.get('id'));
		this.poiSubCategoriesStore.load();
		this.getMenuStack().push(this.getPoiSubCategories());
	},
	
	/**
	 * Event handler triggered when an item is tapped on the POI Sub-Categories menu
	 * @param dv The dataview containing the item
	 * @param index The index of the tapped item
	 * @param item The item that was tapped
	 * @param e The triggered event
	 */
	onPoiSubCategoriesItemTap: function(dv, index, item, e) {
		var record = this.poiSubCategoriesStore.getAt(index);
		this.poiLocationsStore.removeAll();
		this.poiLocationsStore.getProxy().setCategoryId(record.get('id'));
		this.poiLocationsStore.load();
		this.getMenuStack().push(this.getPoiLocations());
	},	
	
	/**
	 * Event handler triggered when an item is tapped on the Favourites menu
	 * @param dv The dataview containing the item
	 * @param index The index of the tapped item
	 * @param item The item that was tapped
	 * @param e The triggered event
	 */
	onFavouritesListItemTap: function(dv, index, item, e) {
		var record = Ext.getStore('Favourites').getAt(index);
		this.navigateTo(record.getData());
	},

	/**
	 * Event handler triggered when an item is tapped on the History menu
	 * @param dv The dataview containing the item
	 * @param index The index of the tapped item
	 * @param item The item that was tapped
	 * @param e The triggered event
	 */
	onHistoryListItemTap: function(dv, index, item, e) {
		var record = Ext.getStore('History').getAt(index);
		this.navigateTo(record.getData());
	},

	/**
	 * Event handler triggered when an item is tapped on the POI Locations menu
	 * @param dv The dataview containing the item
	 * @param index The index of the tapped item
	 * @param item The item that was tapped
	 * @param e The triggered event
	 */
	onPoiLocationsListItemTap: function(dv, index, item, e) {
		var record = Ext.getStore('PoiLocations').getAt(index);
		this.navigateTo(record.getData());
	},
	
	/**
	 * Begin the navigation to a specific location
	 * @param location {Object} The location to which we want to navigate
	 */
	navigateTo: function(location) {
		this.onHide();
		this.getApplication().fireEvent('map_index', { routing: true });
		car.navigation.navigateTo(location, null, function(error) {
			this.getApplication().fireEvent('navigation_error', error);
		}.bind(this));
	},

	/**
	 * Event handler triggered when an item is tapped on the add favourites list
	 * @param dv {Object} Ext.dataview.DataView
	 * @param index {Number} The index of the item tapped
	 * @param target {Object} The element or DataItem tapped
	 * @param record {Object} The record associated to the item
	 * @param e {Object} The event object
	 * @param eOpts {Object} The options object passed to Ext.util.Observable.addListener
	 */
	onFavouritesAddListItemTap: function(dv, index, target, record, e, eOpts) {
		car.navigation.addFavourite(record.getData());
		Ext.getStore('Favourites').load();
		
		// Pop the add favourites menu off of the stack
		this.getMenuStack().pop(this.getFavouritesAdd());
	},

	/**
	 * Event handler triggered when an item is tapped and held on the add favourites list
	 * @param dv {Object} Ext.dataview.DataView
	 * @param index {Number} The index of the item tapped
	 * @param target {Object} The element or DataItem tapped
	 * @param record {Object} The record associated to the item
	 * @param e {Object} The event object
	 * @param eOpts {Object} The options object passed to Ext.util.Observable.addListener
	 */
	onFavouritesListItemTapHold: function(dv, index, target, record, e, eOpts) {
		//prevent the tap from firing
		dv.suspendEvents(false);

		//prompt for deletion
		Ext.Msg.confirm('Remove Favourite', 'Are you sure you want to remove this location from your favourites?', function(buttonId, value, opt) {
			//confirm deletion
			if (buttonId == 'yes') {
				try {
					car.navigation.removeFavourite(record.getData().id);
					Ext.getStore('Favourites').load();
				} catch (ex) {
					console.error('Error removing navigation favourite', ex);
				}
			}
			//re-enable list events
			dv.resumeEvents();

		}, this);
	},
});