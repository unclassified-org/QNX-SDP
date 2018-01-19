/**
 * This is the application definition file
 * @author mlapierre
 *
 * $Id: app.js 2530 2012-05-18 21:48:36Z lgreenway@lixar.com $
 */
Ext.Loader.setConfig({ enabled: true, disableCaching:false });

QnxCar.init();
QnxCar.System.Settings.init();
QnxCar.Vehicle.Sensors.init();
QnxCar.Media.Sources.init();
QnxCar.Remote.Media.init();
QnxCar.Media.Audio.init();
QnxCar.Apps.Core.init();
QnxCar.System.Theme.init("MediaControl");

Ext.application({
	name: 'MediaPlayer',

    eventPublishers: {
        touchGesture: {
            moveThrottle: 10,
        },
    },

	profiles:	[
					'high',
					'mid',
					'hd',
					'dab',
				],

	models:		[	'HomeItems', 
					'MenuItem', 
					'Song',
					'Video',
					'DabFrequency',
					'DabService',
					'DabComponent',
				],

	stores: 	[	'Albums',
					'Artists',
					'AudioPlaylist',
					'BrowseBy',
					'Genres',
					'HomeItems',
					'MediaSources',
					'RadioSources',
					'Songs',
					'VideoPlaylist',
					'Videos',
					'SearchResults',
					'RadioTuners',
					'RadioPresets',
					'PandoraStations',
					'Dab3Frequencies',
					'DabLFrequencies',
					'DabServices',
					'DabComponents',
				],
	
	controllers:[	'QnxCar', 
					'Home', 
					'Menu',
					'Audio', 
					'Video', 
					'Pandora',
					'Search',
					'Media',
				],
				
	views: 		[	'Audio',
					'Home', 
					'Menu',
					'Video',
					'Pandora',
					'Search',
				],
	
	/**
	 * Method called after all the controller init but before controller launch
	 */
	launch: function() {
		Ext.Viewport.add([
			Ext.create('MediaPlayer.view.Home'),
			Ext.create('MediaPlayer.view.Menu'),
			Ext.create('MediaPlayer.view.Audio'),
			Ext.create('MediaPlayer.view.Video'),
			Ext.create('MediaPlayer.view.Pandora'),
			Ext.create('MediaPlayer.view.Search'),
		]);
		
		if(this.getCurrentProfile() != null)
		{
			Ext.getBody().set( { 'data-currentProfile': this.getCurrentProfile().getName() } );
		}
		
		// Override default message box z-index
		Ext.Msg.setZIndex(9999);
	}
});

/**
 * PATCH: This is a fix for sencha issue TOUCH-2849
 * We will need to remove this after upgrading to 2.0.2 when it is released
 */
Ext.define('Ext.data.StoreFix', {
    override: 'Ext.data.Store',
    filter: function(property, value, anyMatch, caseSensitive) {
        var data = this.data,
            filter = property ? ((Ext.isFunction(property) || property.isFilter) ? property : {
                property     : property,
                value        : value,
                anyMatch     : anyMatch,
                caseSensitive: caseSensitive,
                // By setting the id we ensure there is only one filter active
                // at a time for this property.
                id           : property
            }) : null;

        if (this.getRemoteFilter()) {
            if (property) {
                if (Ext.isString(property)) {
                    data.addFilters(filter);
                }
                else if (Ext.isArray(property) || property.isFilter) {
                    data.addFilters(property);
                }
            }
        } else {
            data.filter(filter);
            this.fireEvent('filter', this, data, data.getFilters());
            this.fireEvent('refresh', this, data);
        }
    }
});
