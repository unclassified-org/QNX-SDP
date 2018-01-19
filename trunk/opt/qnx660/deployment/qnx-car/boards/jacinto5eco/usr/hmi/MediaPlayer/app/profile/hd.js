/**
 * The default, hd-quality profile definition
 */
Ext.define('MediaPlayer.profile.hd', {
	extend : 'Ext.app.Profile',

	config: {
		name: 'hd',

		models:		[],
		stores: 	[],
		controllers:['Radio'],
		views:		['Radio'],
	},
	
	isActive : function() {
		// TODO: Load this information from the Settings API
		return QnxCar.System.Settings.get('mediaPlayer_profile') == 'hd';
		//return true;
	},

	launch: function() {
		Ext.create('MediaPlayer.view.hd.Radio');
	},
});
