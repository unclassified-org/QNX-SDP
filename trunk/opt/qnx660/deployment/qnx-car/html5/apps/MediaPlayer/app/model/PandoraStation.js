/**
 * A Pandora radio station.
 * @author lgreenway@lixar.com
 *
 * $Id: PandoraStation.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.model.PandoraStation', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{name: "allowAddMusic",		type: "bool"},
			{name: "allowDelete",		type: "bool"},
			{name: "allowRename",	type: "bool"},
			{name: "artUrl",	type: "string"},
			{name: "dateCreated",	type: "date"},
			{name: "isQuickMix",	type: "bool"},
			{name: "isShared",	type: "bool"},
			{name: "stationId",	type: "string"},
			{name: "stationName",	type: "string"},
			{name: "stationToken",	type: "string"},
		]
	}
});
