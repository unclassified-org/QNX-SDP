/**
 * A Pandora radio station.
 * @author lgreenway@lixar.com
 *
 * $Id: PandoraStation.js 5983 2013-04-02 15:37:49Z lgreenway@qnx.com $
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
