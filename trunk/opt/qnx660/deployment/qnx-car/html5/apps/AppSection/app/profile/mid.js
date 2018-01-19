/**
 * The mid-quality profile definition.
 * @author lgreenway@lixar.com
 *
 * $Id: mid.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('AppSection.profile.mid', {
	extend : 'Ext.app.Profile',

	config: {
		name: 'mid',

		models:		[],
		stores: 	[],
		controllers:['Home'],
		views:		['Home'],
	},
	
	isActive : function() {
		//return qnx.settings.get('appSection_profile') == 'mid';
		return false; //true;
	},
	
	launch: function() {
		Ext.Viewport.add([
			Ext.create('AppSection.view.mid.Home'),
		]);
	},
});