Ext.define('MediaPlayer.store.DabLFrequencies', {
	extend: 'Ext.data.Store',

	requires: [
		'MediaPlayer.model.DabFrequency'
	],

	config: {
		model: 'MediaPlayer.model.DabFrequency',
		autoLoad: true,
		data: [
			{name: 'LA', freq: '1452960'},
			{name: 'LB', freq: '1454672'},
			{name: 'LC', freq: '1456384'},
			{name: 'LD', freq: '1458096'},
			{name: 'LE', freq: '1459808'},
			{name: 'LF', freq: '1461520'},
			{name: 'LG', freq: '1463232'},
			{name: 'LH', freq: '1464944'},
			{name: 'LI', freq: '1466656'},
			{name: 'LJ', freq: '1468368'},
			{name: 'LK', freq: '1470080'},
			{name: 'LL', freq: '1471792'},
			{name: 'LM', freq: '1473504'},
			{name: 'LN', freq: '1475216'},
			{name: 'LO', freq: '1476928'},
			
		],
		storeId: 'dabLFreqs',
	},
});