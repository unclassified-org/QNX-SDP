/**
 * The mid-quality profile definition.
 * @author lgreenway@lixar.com
 *
 * $Id: mid.js 2475 2012-05-14 20:43:55Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.profile.mid', {
	extend : 'Ext.app.Profile',

	config: {
		name: 'mid',

		models:		[],
		stores: 	[],
		controllers:['Radio'],
		views:		['Radio'],
	},
	
	isActive : function() {
		// TODO: Load this information from the Settings API
		return false;
	},
	
	launch: function() {
		Ext.create('MediaPlayer.view.mid.Radio');
	},
});