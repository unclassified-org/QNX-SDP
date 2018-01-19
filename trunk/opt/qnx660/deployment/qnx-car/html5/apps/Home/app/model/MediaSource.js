/**
 * A media source.
 * @author lgreenway
 *
 * $Id: MediaSource.js 7035 2013-08-28 14:19:55Z lgreenway@qnx.com $
 */
Ext.define('Home.model.MediaSource', {
	extend: 'Ext.data.Model',
	
	config: {
		fields: [
			{name: "id",			type: "string"},
			{
				name: "name",
				type: "string",
				convert: function(value) {
					return value || 'Unnamed';
				}
			},
			{name: "uid",			type: "string"},
			{name: "viewName",		type: "string"},
			{name: "type",			type: "int"},
			{name: "ready",			type: "boolean"}
		]
	}
});