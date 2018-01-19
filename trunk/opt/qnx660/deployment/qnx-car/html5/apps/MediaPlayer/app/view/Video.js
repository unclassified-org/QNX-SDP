/**
 * The video player view
 * @author mlapierre
 *
 * $Id: Video.js 5737 2013-01-28 16:51:35Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.Video', {
	extend: 'Ext.Panel',
	xtype: 'videoView',
	
	requires: [
		'MediaPlayer.view.common.PlaylistControls',
		'MediaPlayer.view.common.MediaControls',
		'QnxCar.view.menu.ShowButton',
		'Ext.Video',
	],
	
	config: {
		layout: 'vbox',
		cls: 'media-panel',
		items: [
			{
				xtype: 'menuShowButton',
			},{
				xtype: 'container',
				layout: 'hbox',
				cls: 'video-hbox',
				items: [
					//left hand column
					{
						layout: 'vbox',
						cls: 'video-vbox-left',
						items: [
							{
								action: 'title',
								cls: 'video-title',
							},{
								xtype: 'mediaControls',
								cls: 'video-mediacontrols',
							},{
								action: 'fullscreen',
								xtype: 'button',
								text: 'FULL SCREEN',
								cls: 'button-large video-fullscreen',
								//patch to disable this button until this is fixed in torch
								//doing it here so we don't have to modify 3 themes. regen css, etc
								disabled: true,
								style: 'opacity: 0.5; pointer-events: none', 
							}
						]
					},
					//right hand column
					{
						layout: 'vbox',
						cls: 'video-vbox-right',
						items: [
							{
								xtype: 'video',
								cls: 'video-placeholder',
								enableControls: false,
							},{
								action: 'progressbar',
								xtype: 'progressbar',
								cls: 'progressbar video-progressbar'
							},{
								action: 'progresstime',
								html: '0:00 / 0:00',
								cls: 'video-progresstime',
							}
						]
					}
				]
			}
		]
	},
});