/**
 * Represents a recently visited location
 * @author mlapierre
 *
 * $Id: RecentLocation.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Navigation.model.RecentLocation', {
	extend: 'Navigation.model.Location',

	requires: [
		'Navigation.model.Location'
	],

	config: {
		fields: [
			{ name: "timestamp",	type: "int" },
		],
	},
});
