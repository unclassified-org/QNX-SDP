/**
 * Displays the Pandora media controls: pause, play, and skip.
 * @author lgreenway@lixar.com
 *
 * $Id: MediaControls.js 6867 2013-07-22 14:08:37Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.radio.pandora.MediaControls', {
	extend: 'Ext.Container',
	xtype: 'pandoraMediaControls',

	config: {
		control: {
			'button[action="pause"]': {
				tap: function() { this.fireEvent('pause'); }
			},
			'button[action="resume"]': {
				tap: function() { this.fireEvent('resume'); }
			},
			'button[action="skip"]': {
				tap: function() { this.fireEvent('skip'); }
			}
		},
		
		xtype: 'panel',
		cls: 'pandora-mediacontrols',
		layout: {
			type: 'hbox',
			align: 'center',
			pack: 'center',
		},
		defaults: {
			xtype: 'button'
		},
		items: [
			{
				action: 'pause',
				cls: 'button-pauseSmall button-image'
			},{
				action: 'resume',
				cls: 'button-play button-image'
			},{
				action: 'skip',
				cls: 'button-skip button-image'
			}
		]
	},
});