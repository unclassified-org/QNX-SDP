/**
 * Represents a POI category
 * @author mlapierre
 *
 * $Id: PoiCategory.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Navigation.model.PoiCategory', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{ name: "id",			type: "int" },
			{ name: "name",			type: "string" },
			{ name: "type",			type: "string" },
		],
	},
});
