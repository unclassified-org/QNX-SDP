Ext.define('MediaPlayer.model.NowPlaying', {
	extend: 'Ext.data.Model',

	requires: [ 'MediaPlayer.model.MediaNode' ],

	config: {
		fields: [
			{name: "playerName",	type: "string"},
			{name: "mediaNode",	type: "auto"},
			{name: "index",	type: "int"},
			{name: "position",	type: "int", defaultValue: 0},
		]
	}
});