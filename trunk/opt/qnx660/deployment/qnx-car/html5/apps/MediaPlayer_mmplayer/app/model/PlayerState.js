Ext.define('MediaPlayer.model.PlayerState', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{name: "playerName",		type: "string"},
			{name: "shuffleMode",		type: "int"},
			{name: "repeatMode",		type: "int"},
			{name: "playerStatus",		type: "int"},
			{name: "playbackRate",		type: "float"}
		]
	}
});