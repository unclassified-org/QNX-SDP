/**
 * The high-quality profile definition
 * @author lgreenway@lixar.com
 *
 * $Id: high.js 6632 2013-06-20 15:18:00Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.profile.high', {
	extend : 'Ext.app.Profile',

	config: {
		name: 'high',

		controllers:['Radio', 'Video'],
		views:		['Radio'],
	},
	
	isActive : function() {
		return qnx.settings.get(['mediaPlayer_profile']).mediaPlayer_profile == 'high';
	},

	launch: function() {
		Ext.create('MediaPlayer.view.high.Radio');
	}
});
