/**
 * Represents a single media source
 * @author mlapierre
 *
 * $Id: MediaSource.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.model.MediaSource', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{name: "id",		type: "string"},
			{name: "name",		type: "string"},
			{name: "type",		type: "string"},
			{name: "fs",		type: "string"},
			{name: "db",		type: "string"},
			{name: "mount",		type: "string"},
			{name: "synched",	type: "boolean"},
			{name: "imagePath",	type: "string"},
		]
	}
});
