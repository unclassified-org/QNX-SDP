/**
 * The audio player view
 * @author mlapierre
 *
 * $Id: Audio.js 6631 2013-06-20 15:14:59Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.Audio', {
	extend: 'Ext.Panel',
	xtype: 'audioView',
	
	requires: [
		'MediaPlayer.view.common.PlaylistControls',
		'MediaPlayer.view.common.MediaControls',
		'MediaPlayer.view.audio.NowPlaying',
		'MediaPlayer.view.common.Coverflow',
		'QnxCar.view.menu.ShowButton',
		'Ext.Img'
	],
	
	initialize: function() {
		// Change the coverflow functionality based on the current profile
		if(MediaPlayer.app.getCurrentProfile() instanceof MediaPlayer.profile.mid
			&& this.down('coverflow'))
		{
			this.down('coverflow').setFreeFlow(false);
		}
	},

	config: {
		layout: 'vbox',
		cls: 'media-panel',
		items: [
			{
				xtype: 'menuShowButton',
			},{
				xtype: 'container',
				layout: 'hbox',
				cls: 'music-panel',
				flex: 1,
				items: [
					{
						xtype: 'audioNowPlaying',
						cls: 'music-nowplaying'
					},{
						xtype: 'panel',
						layout: {
							type: 'vbox',
							align: 'center',
							pack: 'end'
						},
						cls: 'music-centerpanel',
						items: [
							{
								xtype: 'mediaControls',
								cls: 'music-mediacontrols',
							}
						]
					},{
						xtype: 'playlistControls',
						cls: 'music-playlistcontrols',
					}
				]
			},{
				xtype: 'container',
				height: 0,
				items: [
					{
						xtype: 'coverflow',
						cls: 'coverflow',
						store: 'TrackSession'
					}
				]
			}
			
		]
	}
});