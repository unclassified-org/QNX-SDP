Ext.define('MediaPlayer.store.Dab3Frequencies', {
	extend: 'Ext.data.Store',

	requires: [
		'MediaPlayer.model.DabFrequency'
	],

	config: {
		model: 'MediaPlayer.model.DabFrequency',
		autoLoad: true,
		data: [
			{name: '5A', freq: '174928'},
			{name: '5B', freq: '176640'},
			{name: '5C', freq: '178352'},
			{name: '5D', freq: '180064'},
			{name: '6A', freq: '181936'},
			{name: '6B', freq: '183648'},
			{name: '6C', freq: '185360'},
			{name: '6D', freq: '187072'},
			{name: '7A', freq: '188928'},
			{name: '7B', freq: '190640'},
			{name: '7C', freq: '192352'},
			{name: '7D', freq: '194064'},
			{name: '8A', freq: '195936'},
			{name: '8B', freq: '197648'},
			{name: '8C', freq: '199360'},
			{name: '8D', freq: '201072'},
			{name: '9A', freq: '202928'},
			{name: '9B', freq: '204640'},
			{name: '9C', freq: '206352'},
			{name: '9D', freq: '208064'},
		],
		storeId: 'dab3Freqs',
	},
});