/**
 * This is the application definition file
 * @author mlapierre
 *
 * $Id: app.js 7058 2013-08-30 17:21:50Z mlapierre@qnx.com $
 */

Ext.Loader.setConfig({ enabled: true, disableCaching: false });

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
					'Video',
					'MediaSource',
					'MediaSourceCapabilities'
				],

	stores: 	[	'HomeItems',
					'MediaSources',
					'SearchSources',
					'RadioSources',
					'SearchResults',
					'RadioTuners',
					'RadioPresets',
					'PandoraStations',
					'NowPlaying',
					'PlayerStates',
					'TrackSession'
				],
	
	controllers:[	'MediaPlayer',
					'Application',
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

		// The name registered with qnx.application.event is the ID of the application
		qnx.application.event.register('MediaPlayer_mmplayer');
		
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
				property	 : property,
				value		: value,
				anyMatch	 : anyMatch,
				caseSensitive: caseSensitive,
				// By setting the id we ensure there is only one filter active
				// at a time for this property.
				id		   : property
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