Ext.define('MediaPlayer.model.DabFrequency', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{name: "name",  type: "string"},
			{name: "freq",	type: "int"},
		]
	}
});