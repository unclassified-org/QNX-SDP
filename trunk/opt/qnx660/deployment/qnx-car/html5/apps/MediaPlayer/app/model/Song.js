/**
 * Represents a single song (audio track)
 * @author mlapierre
 *
 * $Id: Song.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.model.Song', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{name: "fid",		type: "int"},
			{name: "title",		type: "string"},
			{name: "duration",	type: "int"},
			{name: "album",		type: "string"},
			{name: "artist",	type: "string"},
			{name: "artwork",	type: "string"},
		]
	},
});
