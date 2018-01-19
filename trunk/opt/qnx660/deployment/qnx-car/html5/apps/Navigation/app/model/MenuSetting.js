/**
 * Represents a single menu item
 * @author mlapierre
 *
 * $Id: MenuItem.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Navigation.model.MenuSetting', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{ name: "text",		type: "string" },
			{ name: "value",	type: "string" },
		],
	},
});
