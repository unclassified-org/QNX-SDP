/**
 * Represents a location
 * @author mlapierre
 *
 * $Id: Location.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Navigation.model.Location', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{ name: "id",			type: "int" },
			{ name: "name",			type: "string" },
			{ name: "number",		type: "string" },
			{ name: "street",		type: "string" },
			{ name: "city",			type: "string" },
			{ name: "province",		type: "string" },
			{ name: "postalCode",	type: "string" },
			{ name: "country",		type: "string" },
			{ name: "type",			type: "string" },
			{ name: "distance",		type: "int" },
			{ name: "latitude",		type: "float" },
			{ name: "longitude",	type: "float" },
		],
	},
});
