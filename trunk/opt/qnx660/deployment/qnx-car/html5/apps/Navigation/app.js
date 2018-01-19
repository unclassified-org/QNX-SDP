/**
 * This is the application definition file
 * @author mlapierre
 *
 * $Id: app.js 6690 2013-06-26 18:36:35Z mlytvynyuk@qnx.com $
 */
Ext.Loader.setConfig({ enabled: true,  disableCaching: false  });

// Common components
Ext.Loader.setPath('QnxCar', 'file:///apps/common/ui-framework/sencha/');

Ext.application({
	name: 'Navigation',
	
    eventPublishers: {
        touchGesture: {
            moveThrottle: 10 * (screen.height / 480),
        },
    },

	controllers: 	['Home', 'Map', 'Menu', 'Search', 'Settings'],
	stores: 		['HomeItems', 'MainMenu', 'Favourites', 'History', 'PoiCategories', 
					'PoiSubCategories', 'PoiLocations', 'SettingsMenu', 'CityResults', 
					'SettingsPicker', 'StreetResults', 'NumberResults', 'PoiResults', 'AddressResults'],

	launch: function() {
		qnx.application.event.register('navigation');
		
		Ext.Viewport.add([
		   Ext.create('Navigation.view.Home'),
		   Ext.create('Navigation.view.Menu'),
		   Ext.create('Navigation.view.Search'),
		   Ext.create('Navigation.view.Map'),
		]);
	 }
});


Ext.define('Ext.data.reader.EncodedJson', {
    extend: 'Ext.data.reader.Json',
    alternateClassName: 'Ext.data.EncodedJsonReader',
    alias : 'reader.encodedjson',

    //inherit docs
    getResponseData: function(response) {
		if (response && response.responseText) {
			return this.callParent([decodeURIComponent(response.responseText)]);
		} else {
			return this.callParent([response]);
		}
    },
});