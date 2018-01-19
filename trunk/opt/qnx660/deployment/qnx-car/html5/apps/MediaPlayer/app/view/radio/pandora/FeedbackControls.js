/**
 * Displays the Pandora feedback controls: thumbs up, and thumbs down.
 * @author lgreenway@lixar.com
 *
 * $Id: FeedbackControls.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.view.radio.pandora.FeedbackControls', {
	extend: 'Ext.Container',
	xtype: 'pandoraFeedbackControls',


	requires: [
		'MediaPlayer.view.common.ToggleButton',
	],

	statics: {
		THUMB_UP: 'thumbUp',
		THUMB_DOWN: 'thumbDown',
	},

	config: {
		/**
		 * Specifies whether the capability to provide a thumb up
		 * or down feedback is allowed. A typical scenario would be
		 * to disable the feedback capability when an ad is playing.
		 */
		enableFeedback: true,
		
		control: {
			'togglebutton[action="thumbUp"]': {
				tap: function(btn) {
					if(!btn.getToggled())
					{
						btn.setPreventUntoggle(true);
						this.fireEvent('thumbUp');
					}
					
					btnThumbsDown = this.child('togglebutton[action="thumbDown"]');
					if(btnThumbsDown.getToggled())
					{
						btnThumbsDown.setPreventUntoggle(false);
						btnThumbsDown.setToggled(false);
					}
				}
			},
			'togglebutton[action="thumbDown"]': {
				tap: function(btn) {
					if(!btn.getToggled())
					{
						btn.setPreventUntoggle(true);
						this.fireEvent('thumbDown');
					}
					
					btnThumbsUp = this.child('togglebutton[action="thumbUp"]');
					if(btnThumbsUp.getToggled())
					{
						btnThumbsUp.setPreventUntoggle(false);
						btnThumbsUp.setToggled(false);
					}
				}
			}
		},

		xtype: 'panel',
		cls: 'pandora-feedbackcontrols',
		layout: {
			type: 'hbox',
			align: 'start'
		},
		disabled: true,
		items: [
			{
				xtype: 'togglebutton',
				manualUntoggle: true,
				action: 'thumbUp',
				cls: 'button-thumbUp button-image'
			},{
				xtype: 'togglebutton',
				manualUntoggle: true,
				action: 'thumbDown',
				cls: 'button-thumbDown button-image'
			},{
				xtype: 'button',
				action: 'twitter',
				cls: 'button-twitter button-image',
				disabled: true,
			}
		]
	},

	/**
	 * enableFeedback property update hook. Disables the thumb
	 * up and down buttons if feedback is disabled, and enables
	 * if feedback is enabled.
	 */
	updateEnableFeedback: function(newValue, oldValue) {
		Ext.each(this.query('togglebutton'), function(btn) {
			btn.setDisabled(!newValue);
		});
	},

	/**
	 * Sets the thumb state of the feedback controls.
	 * @param thumbState {String} MediaPlayer.view.common.ToggleButton THUMB_UP, or THUMB_DOWN constant.
	 */
	setThumbState: function(thumbState) {
		this.resetThumbState();
		
		var btnThumb = null;
		if(thumbState == Ext.getClass(this).THUMB_UP)
		{
			btnThumb = this.child('togglebutton[action="thumbUp"]');
		}
		else if(thumbState == Ext.getClass(this).THUMB_DOWN)
		{
			btnThumb = this.child('togglebutton[action="thumbDown"]');
		}
		
		if(btnThumb != null)
		{
			btnThumb.setPreventUntoggle(true);
			btnThumb.setToggled(true);
		}
	},
	
	/**
	 * Resets the state of both thumb buttons by unlocking and untoggling.
	 */
	resetThumbState: function() {
		Ext.each(this.query('togglebutton'), function(btn) {
			btn.setPreventUntoggle(false);
			btn.setToggled(false);
		});
	}

});