/**
 * Represents a single media artist
 * @author mlapierre
 *
 * $Id: Artist.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.model.Artist', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{name: "id",			type: "int"},
			{name: "artist",		type: "string"},
			{name: "artwork",	type: "string"},
		]
	}
});
