/**
 * Represents a single media album
 * @author mlapierre
 *
 * $Id: Album.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.model.Album', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{name: "id",		type: "int"},
			{name: "album",		type: "string"},
			{name: "artwork",	type: "string"},
		]
	}
});
