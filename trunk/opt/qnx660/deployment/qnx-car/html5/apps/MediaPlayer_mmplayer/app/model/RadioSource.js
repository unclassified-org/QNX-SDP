/**
 * Represents a single media source
 * @author mlapierre
 *
 * $Id: RadioSource.js 5983 2013-04-02 15:37:49Z lgreenway@qnx.com $
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
