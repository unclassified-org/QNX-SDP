/**
 * This is the application definition file
 * @author mlapierre
 *
 * $Id: app.js 6632 2013-06-20 15:18:00Z lgreenway@qnx.com $
 */

Ext.Loader.setConfig({ enabled: true, disableCaching:false });

//Common components
Ext.Loader.setPath('QnxCar', 'file:///apps/common/ui-framework/sencha/');

Ext.application({
	name: 'MediaPlayer',

    requires: [
        'Ext.MessageBox'
    ],

    eventPublishers: {
        touchGesture: {
            moveThrottle: 5 * (screen.height / 480),
        },
    },

	profiles:	[
					'high',
					'mid',
				],

	models:		[	'HomeItems', 
					'MenuItem',
					'Playlist',
					'Song',
					'Video',
				],

	stores: 	[	'Albums',
					'Artists',
					'AudioPlaylist',
					'BrowseBy',
					'Genres',
					'HomeItems',
					'MediaSources',
					'Playlists',
					'RadioSources',
					'Songs',
					'VideoPlaylist',
					'Videos',
					'SearchResults',
					'RadioTuners',
					'RadioPresets',
					'PandoraStations',
				],
	
	controllers:[	'Application', 
					'Home', 
					'Menu',
					'Audio', 
					'Pandora',
					'Search',
					'Media',
				],
				
	views: 		[	'Audio',
					'Home', 
					'Menu',
					'Video',
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
			Ext.create('MediaPlayer.view.Search'),
		]);

		qnx.application.event.register(this.getApplication().getName());
		
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