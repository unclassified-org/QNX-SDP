/**
 * Represents a single video
 * @author mlapierre
 *
 * $Id: Video.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.model.Video', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{name: "fid",		type: "int"},
			{name: "width",		type: "int"},
			{name: "height",	type: "int"},
			{name: "duration",	type: "int"},
			{name: "title",		type: "string"},
		]
	}
});
