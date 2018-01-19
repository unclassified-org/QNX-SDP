/**
 * Displays the media controls - the back, play, pause and skip buttons
 * @author mlapierre
 *
 * $Id: MediaControls.js 6368 2013-05-27 16:59:58Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.common.MediaControls', {
	extend: 'Ext.Container',
	xtype: 'mediaControls',

	config: {

		listeners: {
			initialize: function() {
				this.on('updatedata', this.onUpdateData);
			}
		},
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

	/**
	 * Updates the HMI based updates on the data store
	 * @param {Object} component The component instance
	 * @param {Object} data The new data
	 */
	onUpdateData: function(component, data) {
		// Use the record assigned to this component rather than the raw data so that we can make assumptions
		// about the structure of the data.
		var playerState = component.getRecord();
		
		if(playerState instanceof MediaPlayer.model.PlayerState) {
			if(playerState.get('playerStatus') == car.mediaplayer.PlayerStatus.PLAYING){
				this.child('[action=pause]').setHidden(false);
				this.child('[action=play]').setHidden(true);
			} else {
				this.child('[action=pause]').setHidden(true);
				this.child('[action=play]').setHidden(false);
			}
		}
	}

});