Ext.define('MediaPlayer.store.DabServices', {
	extend: 'Ext.data.Store',

	requires: [
		'MediaPlayer.model.DabService'
	],

	config: {
		model: 'MediaPlayer.model.DabService',
		autoLoad: true,
		data: [
			{serv: 'Serv0'},
			{serv: 'Serv1'},
			{serv: 'Serv2'},
			{serv: 'Serv3'},
			{serv: 'Serv4'},
			{serv: 'Serv5'},
			{serv: 'Serv6'},
			{serv: 'Serv7'},
			{serv: 'Serv8'},
			{serv: 'Serv9'},
			{serv: 'Serv10'},
		],
		storeId: 'dabServices',
	},
});