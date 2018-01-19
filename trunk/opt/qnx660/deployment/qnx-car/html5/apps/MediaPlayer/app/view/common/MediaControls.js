/**
 * Displays the media controls - the back, play, pause and skip buttons
 * @author mlapierre
 *
 * $Id: MediaControls.js 4647 2012-10-18 18:49:48Z edagenais@lixar.com $
 */
Ext.define('MediaPlayer.view.common.MediaControls', {
	extend: 'Ext.Container',
	xtype: 'mediaControls',

	config: {
		xtype: 'panel',
		layout: {
			type: 'hbox',
			align: 'center'
		},
		defaults: {
			xtype: 'button'
		},
		items: [
			{
				action: 'back',
				cls: 'button-back button-image'
			},{
				action: 'play',
				cls: 'button-play button-image'
			},{
				action: 'pause',
				cls: 'button-pause button-image'
			},{
				action: 'skip',
				cls: 'button-skip button-image'
			}
		]
	},
});