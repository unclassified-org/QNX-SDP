/**
 * Represents a single media source
 * @author mlapierre
 *
 * $Id: RadioSource.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.model.RadioSource', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{name: "id",		type: "string"},
			{name: "name",		type: "string"},
			{name: "type",		type: "string"},
			{name: "available",	type: "boolean"},
		]
	}
});
