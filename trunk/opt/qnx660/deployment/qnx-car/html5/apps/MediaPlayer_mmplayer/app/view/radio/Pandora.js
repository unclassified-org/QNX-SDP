/**
 * The Pandora player view.
 * @author lgreenway@lixar.com
 *
 * $Id: Pandora.js 6609 2013-06-18 21:38:45Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.radio.Pandora', {
	extend: 'Ext.Panel',
	xtype: 'pandoraView',
	
	requires: [
		'MediaPlayer.view.radio.pandora.AlbumArt',
		'MediaPlayer.view.radio.pandora.FeedbackControls',
		'MediaPlayer.view.radio.pandora.MediaControls',
		'MediaPlayer.view.radio.pandora.NowPlaying',
	],
	
	config: {
		layout: 'vbox',
		cls: 'media-panel',
		items: [
			{
				xtype: 'menuShowButton',
			},{
				xtype: 'container',
				cls: 'pandora-panel',
				layout: 'hbox',
				items: [
					{
						xtype: 'pandoraAlbumArt',
					},{
						xtype: 'container',
						layout: 'vbox',
						items: [
							{
								xtype: 'pandoraFeedbackControls',
							},
							{
								xtype: 'img',
								cls: 'pandora-logo',
							},
							{
								xtype: 'pandoraMediaControls',
							},
							{
								xtype: 'pandoraNowPlaying',
								flex: 1,
							}
						]
					}
				]
			}
		]
	}
});