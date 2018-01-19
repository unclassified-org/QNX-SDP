/**
 * Represents a single video
 * @author mlapierre
 *
 * $Id: Video.js 5983 2013-04-02 15:37:49Z lgreenway@qnx.com $
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
