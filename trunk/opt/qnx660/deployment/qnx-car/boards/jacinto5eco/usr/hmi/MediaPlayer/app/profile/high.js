/**
 * The default, high-quality profile definition
 * @author lgreenway@lixar.com
 *
 * $Id: high.js 2475 2012-05-14 20:43:55Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.profile.high', {
	extend : 'Ext.app.Profile',

	config: {
		name: 'high',

		models:		[],
		stores: 	[],
		controllers:['Radio'],
		views:		['Radio'],
	},
	
	isActive : function() {
		// TODO: Load this information from the Settings API
		//return QnxCar.System.Settings.get('mediaPlayer_profile') == 'high';
		return false;
	},

	launch: function() {
		Ext.create('MediaPlayer.view.high.Radio');
	},
});
