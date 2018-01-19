/**
 * Represents a search result
 * @author mlapierre
 *
 * $Id: SearchResult.js 5983 2013-04-02 15:37:49Z lgreenway@qnx.com $
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
