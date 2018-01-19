/**
 * The default, high-quality profile definition
 * @author lgreenway@lixar.com
 *
 * $Id: high.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Communication.profile.high', {
	extend : 'Ext.app.Profile',

	config: {
		name: 'high',

		models:		[],
		stores: 	[],
		controllers:[],
		views:		[],
	},
	
	isActive : function() {
		return qnx.settings.get(['communication_profile']).communication_profile == 'high';
	},

	launch: function() {
	},
});
