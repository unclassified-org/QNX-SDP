/**
 * The mid-quality profile definition.
 * @author lgreenway@lixar.com
 *
 * $Id: mid.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Communication.profile.mid', {
	extend : 'Ext.app.Profile',

	config: {
		name: 'mid',

		models:		[],
		stores: 	[],
		controllers:[],
		views:		[],
	},
	
	isActive : function() {
		return true;
	},
	
	launch: function() {
	},
});