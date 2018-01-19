Ext.define('MediaPlayer.store.PlayerStates', {
	extend: 'Ext.data.Store',
	requires: [
		'MediaPlayer.model.PlayerState',
	],
	
	config: {
		model: 'MediaPlayer.model.PlayerState',
	}
});