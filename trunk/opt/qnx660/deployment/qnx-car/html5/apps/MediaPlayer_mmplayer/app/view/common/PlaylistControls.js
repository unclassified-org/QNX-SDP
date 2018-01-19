/**
 * Displays the playlist controls - repeat one, repeat all and shuffle buttons
 * @author mlapierre
 *
 * $Id: PlaylistControls.js 7259 2013-09-25 12:55:04Z nschultz@qnx.com $
 */
Ext.define('MediaPlayer.view.common.PlaylistControls', {
	extend: 'Ext.Container',
	xtype: 'playlistControls',

	requires: [
		'Ext.Button'
	],

	config: {
		listeners: {
			initialize: function() {
				this.on('updatedata', this.onUpdateData);
			}
		},
		layout: 'hbox',
		defaults: {
			xtype: 'button'
		},
		items: [
			{
				action: 'repeatall',
				cls: 'button-small button-repeat-all',
			},{
				action: 'repeatone',
				cls: 'button-small button-repeat-one',
			},{
				action: 'shuffle',
				cls: 'button-small button-shuffle',
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
			if(playerState.get('shuffleMode') == car.mediaplayer.ShuffleMode.SHUFFLE_ON) {
					this.child('[action=shuffle]').addCls('x-button-pressed');
			} else if(playerState.get('shuffleMode') == car.mediaplayer.ShuffleMode.SHUFFLE_OFF) {
					this.child('[action=shuffle]').removeCls('x-button-pressed');
			}

			if(playerState.get('repeatMode') == car.mediaplayer.RepeatMode.REPEAT_OFF) {
				this.child('[action=repeatall]').removeCls('x-button-pressed');
				this.child('[action=repeatone]').removeCls('x-button-pressed');
			} else if(playerState.get('repeatMode') == car.mediaplayer.RepeatMode.REPEAT_ONE) {
				this.child('[action=repeatone]').addCls('x-button-pressed');
				this.child('[action=repeatall]').removeCls('x-button-pressed');
			} else if(playerState.get('repeatMode') == car.mediaplayer.RepeatMode.REPEAT_ALL) {
				this.child('[action=repeatone]').removeCls('x-button-pressed');
				this.child('[action=repeatall]').addCls('x-button-pressed');
			}
		}
	}

});