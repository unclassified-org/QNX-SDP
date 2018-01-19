/**
 * The default, high-quality profile definition
 * @author lgreenway@lixar.com
 *
 * $Id: high.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('AppSection.profile.high', {
	extend : 'Ext.app.Profile',

	config: {
		name: 'high',

		models:		[],
		stores: 	[],
		controllers:['Home'],
		views:		['Home'],
	},
	
	isActive : function() {
		//var profileSetting = qnx.settings.get('appSection_profile');
		//return profileSetting == 'high' || profileSetting == undefined;
		return true; //qnx.settings.get(['appSection_profile']).appSection_profiles == 'high';
	},

	launch: function() {
		Ext.Viewport.add([
			Ext.create('AppSection.view.high.Home'),
		]);
	},
});
