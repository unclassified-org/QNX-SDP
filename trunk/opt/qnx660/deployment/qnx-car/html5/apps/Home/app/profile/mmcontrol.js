/**
 * The mmcontrol media provider profile.
 * @author lgreenway
 *
 * $Id: mmcontrol.js 7083 2013-09-05 17:50:48Z mlapierre@qnx.com $
 */
Ext.define('Home.profile.mmcontrol', {
	extend : 'Ext.app.Profile',

	config: {
		name: 'mmcontrol',

		controllers:['Media']
	},
	
	isActive : function() {
		return (typeof window.cordova == "undefined" && qnx.settings.get(['home_profile']).home_profile == 'mmcontrol');
	},

	launch: function() {
	}
});
