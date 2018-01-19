/**
 * The mmplayer media provider profile.
 * @author lgreenway
 *
 * $Id: mmplayer.js 7083 2013-09-05 17:50:48Z mlapierre@qnx.com $
 */
Ext.define('Home.profile.mmplayer', {
	extend : 'Ext.app.Profile',

	config: {
		name: 'mmplayer',

		controllers:['Media']
	},
	
	isActive : function() {
		// This profile is loaded last, alphabetically, so we default to true so that at least one profile is selected
		return typeof window.cordova != "undefined" || qnx.settings.get(['home_profile']).home_profile == 'mmplayer' || true;
	},

	launch: function() {
	}
});
