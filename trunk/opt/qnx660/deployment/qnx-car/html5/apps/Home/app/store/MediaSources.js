Ext.define('Home.store.MediaSources', {
	extend: 'Ext.data.Store',
	requires: [
		'Home.model.MediaSource',
	],
	
	config: {
		model: 'Home.model.MediaSource',
		data: []
	}
});