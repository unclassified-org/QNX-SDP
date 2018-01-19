/**
 * The default, hd-quality profile definition
 */
Ext.define('MediaPlayer.profile.dab', {
	extend : 'Ext.app.Profile',

	config: {
		name: 'dab',

		models:		[],
		stores: 	[],
		controllers:['Radio'],
		views:		['Radio'],
	},
	
	isActive : function() {
		// TODO: Load this information from the Settings API
		return QnxCar.System.Settings.get('mediaPlayer_profile') == 'dab';
		//return false;
	},

	launch: function() {
		Ext.create('MediaPlayer.view.dab.Radio');
	},
});
