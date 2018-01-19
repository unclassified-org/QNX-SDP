/**
 * Represents a single media genre
 * @author mlapierre
 *
 * $Id: Genre.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.model.Genre', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{name: "id",		type: "int"},
			{name: "genre",		type: "string"},
			{name: "artwork",	type: "string"},
		]
	}
});
