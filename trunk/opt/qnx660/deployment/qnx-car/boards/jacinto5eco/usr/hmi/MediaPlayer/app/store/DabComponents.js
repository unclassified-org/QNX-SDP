Ext.define('MediaPlayer.store.DabComponents', {
	extend: 'Ext.data.Store',

	requires: [
		'MediaPlayer.model.DabService'
	],

	config: {
		model: 'MediaPlayer.model.DabComponent',
		autoLoad: true,
		data: [
			{comp: 'Cmp0'},
			{comp: 'Cmp1'},
			{comp: 'Cmp2'},
			{comp: 'Cmp3'},
			{comp: 'Cmp4'},
			{comp: 'Cmp5'},
			{comp: 'Cmp6'},
			{comp: 'Cmp7'},
			{comp: 'Cmp8'},
			{comp: 'Cmp9'},
		],
		storeId: 'dabComponents',
	},
});