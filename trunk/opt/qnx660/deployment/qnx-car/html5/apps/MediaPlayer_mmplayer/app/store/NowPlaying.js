Ext.define('MediaPlayer.store.NowPlaying', {
	extend: 'Ext.data.Store',
	requires: [
		'MediaPlayer.model.NowPlaying',
	],
	
	config: {
		model: 'MediaPlayer.model.NowPlaying',
	}
});