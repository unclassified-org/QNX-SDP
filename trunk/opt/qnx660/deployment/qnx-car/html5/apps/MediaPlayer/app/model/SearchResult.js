/**
 * Represents a search result
 * @author mlapierre
 *
 * $Id: SearchResult.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.model.SearchResult', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{name: "name",	type: "string"},
			{name: "type",	type: "string"},
			{name: "dbId",	type: "int"},
		]
	}
});
