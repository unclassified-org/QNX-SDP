/**
 * The controller responsible for the settings.
 * @author mlapierre
 *
 * $Id: Settings.js 6299 2013-05-17 20:45:36Z mlapierre@qnx.com $
 */
Ext.define('Navigation.controller.Settings', {
	extend:'Ext.app.Controller',

	statics: {
		settingValues: {
			nav_language: {
				en_US: 'US English',
				en_UK: 'UK English',
				fr_CA: 'Français',
				es_US: 'Español'
			},
			nav_voice: {
				rupert: 'Rupert',
				steve: 'Steve',
				eliza: 'Eliza',
				marie: 'Marie',
				misha: 'Misha'
			},
			nav_mapStyle: {
				day: 'Day Mode',
				night: 'Night Mode',
				dayNight: 'Day + Night Mode'
			},
			nav_routePreference: {
				shortest: 'Shortest',
				fastest: 'Fastest'
			},
			nav_unit: {
				metric: 'Metric (km)',
				imperial: 'Imperial (mi)'
			}
		},
	},
	config:{
		refs:{
			menuStack: 'menuView > stackedMenu',

			settings: 'menuSettings',
			
			picker: { selector: 'menuSettingsPicker', xtype: 'menuSettingsPicker', autoCreate: true },

			languageSettings: 'menuSettingsLanguage',
			languageButton: 'menuSettingsLanguage button[action=nav_language]',
			voiceButton: 'menuSettingsLanguage button[action=nav_voice]',

			mapSettings: 'menuSettingsMap',
			mapStyleButton: 'menuSettingsMap button[action=nav_mapStyle]',

			routeSettings: 'menuSettingsRoute',
			routePreferenceButton: 'menuSettingsRoute button[action=nav_routePreference]',

			unitSettings: 'menuSettingsUnits',
			unitButton: 'menuSettingsUnits button[action=nav_unit]',

		},
		control:{
			languageSettings: {
				initialize: 'initializeSettingsMenu'
			},
			mapSettings: {
				initialize: 'initializeSettingsMenu'
			},
			routeSettings: {
				initialize: 'initializeSettingsMenu'
			},
			unitSettings: {
				initialize: 'initializeSettingsMenu'
			},
			
			'menuSettingsRoute checkboxfield':{
				check: 'onCheckboxCheckEvent',
				uncheck: 'onCheckboxCheckEvent',
			},
			'menuSettingsMap checkboxfield':{
				check: 'onCheckboxCheckEvent',
				uncheck: 'onCheckboxCheckEvent',
			},
			'menuSettingsPicker > list': {
				itemtap: 'onPickerItemTap',
			},
			languageButton: {
				release: function(button, e, eOpts) {
					this.showPicker(button, Navigation.controller.Settings.settingValues.nav_language);
				}
			},
			voiceButton: {
				release: function(button, e, eOpts) {
					this.showPicker(button, Navigation.controller.Settings.settingValues.nav_voice);
				}
			},
			mapStyleButton: {
				release: function(button, e, eOpts) {
					this.showPicker(button, Navigation.controller.Settings.settingValues.nav_mapStyle);
				}
			},
			routePreferenceButton: {
				release: function(button, e, eOpts) {
					this.showPicker(button, Navigation.controller.Settings.settingValues.nav_routePreference);
				}
			},
			unitButton: {
				release: function(button, e, eOpts) {
					this.showPicker(button, Navigation.controller.Settings.settingValues.nav_unit);
				}
			},
		},
		pickerButton: null,
	},

	/**
	 * Method called when app is ready to launch
	 */
	launch: function () {
	},

	/**
	 * Method called when a settings checkbox is checked or unchecked
	 * @param checkbox {Object} The checkbox object
	 * @param event {Object} 
	 */
	onCheckboxCheckEvent: function(checkbox, event, opts) {
		//save the setting
		car.profile.setSetting(checkbox.getName(), checkbox.getChecked());
	},

	/**
	 * Initializes the setting values for the specified settings menu.
	 * @param {Ext.Component} settingsMenu The settings menu.
	 */
	initializeSettingsMenu: function(menu) {	
		if (menu) {
			car.profile.getSettings(function(profileSettings) {
				//cleanup the settings into a more usable hashtable and filter non-nav settings
				var settings = {};
				for (var i=0; i<profileSettings.length; i++) {
					//check if this is a nav setting
					if (profileSettings[i].key.indexOf('nav_') == 0) {
						settings[profileSettings[i].key] = profileSettings[i].value;
					}
				}
				
				if(menu === this.getLanguageSettings()) {
					// Initialize the language settings menu
					this.getLanguageButton().setHtml(this.getSettingValue(settings, 'nav_language').toUpperCase());
					this.getVoiceButton().setHtml(this.getSettingValue(settings, 'nav_voice').toUpperCase());
					
				} else if(menu === this.getMapSettings()) {
					// Initialize the map settings menu
					this.getMapStyleButton().setHtml(this.getSettingValue(settings, 'nav_mapStyle').toUpperCase());
					
				} else if(menu === this.getRouteSettings()) {
					// Initialize the route settings menu
					this.getRoutePreferenceButton().setHtml(this.getSettingValue(settings, 'nav_routePreference').toUpperCase());
					
				} else if(menu === this.getUnitSettings()) {
					// Initialize the unit settings menu
					this.getUnitButton().setHtml(this.getSettingValue(settings, 'nav_unit').toUpperCase());
				}
				
				// Set the state of the checkboxes in the settings menu
				var keys = Object.keys(settings);
				for (var i=0; i<keys.length; i++) {
					if (settings[keys[i]] == "true") {
						var checkboxes = menu.query('checkboxfield[name=' + keys[i] + ']');
						if (checkboxes && checkboxes[0]) {
							checkboxes[0].setChecked(true);
						}
					}
				}
			}.bind(this));
		}
	},
	
	/**
	 * Shows the settings picker with the specified list of items
	 * @param button {Object} The button that launched the picker
	 * @param items {Object} A key/value object containing the items to show in the picker
	 */
	showPicker: function(button, items) {
		//remember the picker button
		this.setPickerButton(button);

		//build the picker list
		var menuSettings = [];
		var keys = Object.keys(items);
		for (var i=0; i<keys.length; i++) {
			menuSettings.push({
				text: items[keys[i]],
				value: keys[i]
			});
		}

		//populate the store
		var store = Ext.getStore('SettingsPicker');
		store.removeAll();
		store.add(menuSettings);

		//show the picker
		this.getMenuStack().push(this.getPicker());
	},

	/**
	 * Event handler triggered when an item is tapped on the picker list
	 * @param dv {Object} Ext.dataview.DataView
	 * @param index {Number} The index of the item tapped
	 * @param target {Object} The element or DataItem tapped
	 * @param record {Object} The record associated to the item
	 * @param e {Object} The event object
	 * @param eOpts {Object} The options object passed to Ext.util.Observable.addListener
	 */
	onPickerItemTap: function(dv, index, target, record, e, eOpts) {
		//update the button
		var button = this.getPickerButton();
		button.setHtml(record.get('text').toUpperCase());

		//hide the sheet
		this.getMenuStack().pop(this.getPicker());

		//save the setting
		car.profile.setSetting(button.config.action, record.get('value'));
	},


	/**
	 * Method that determines the display value of a current setting
	 * @param settings {Object} The personalization settings for the current user
	 * @param key {String} The key of the setting to find
	 * @returns {String} The display value of the chosen setting
	 */
	getSettingValue: function(settings, key) {
		var settingValues = Navigation.controller.Settings.settingValues;
		if (settings && settings[key] && settingValues[key]) {
			//return user setting
			var value = settingValues[key][settings[key]];
			if (value && value.length > 0) {
				return value;
			}
		}
		//return default value for current key
		return settingValues[key][Object.keys(settingValues[key])[0]];
	},
});