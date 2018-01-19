/**
 * The default mid-quality profile definition.
 * @author lgreenway@lixar.com
 *
 * $Id: mid.js 6632 2013-06-20 15:18:00Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.profile.mid', {
	extend : 'Ext.app.Profile',

	config: {
		name: 'mid',

		controllers:['Radio', 'Video'],
		views:		['Radio'],
	},
	
	isActive : function() {
		return true;
	},
	
	launch: function() {
		Ext.create('MediaPlayer.view.mid.Radio');
		
		var videoItem = Ext.getStore('HomeItems').findRecord('event', 'video_index');
		if(videoItem) {
			videoItem.set('available', false);
		}
	}
});