/**
 * Displays a progress bar
 * @author mlapierre
 *
 * $Id: ProgressBar.js 6102 2013-04-24 18:11:54Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.common.ProgressBar', {
	extend: 'Ext.Container',
	xtype: 'progressbar',

	/**
	 * @event seek
	 * Fires when the user releases the control to perform a seek operation.
	 * @param {MediaPlayer.view.common.ProgressBar} this The progress bar component which fired the event.
	 * @param {Number} position The position of the seek, in percentage.
	 */
	
	config: {
		cls: 'progressbar',
		items: [{
			action: 'progressbarHighlight',
			cls: 'progressbar-highlight',
		}],
		
		/**
		 * @property {Number}
		 * The progress to display, ranging from 0-100.
		 */
		progress: 0,
		
		/**
		 * @property {Boolean}
		 * Sets whether the progress bar accepts touch events to perform seek operations. Defaults to true.
		 * @default true
		 */
		seekable: true
	},
	
	/**
	 * When true, updates to the progress value will not be visually applied to the control.
	 * This is used to prevent highlight jitter when the user is performing a seek operation.
	 * @private
	 */
	disableProgressUpdates: false,
	
	/**
	 * Specifies the delay, in milliseconds, that visual progress updates via setPosition calls will be enabled
	 * after a seek event is fired. This accomodates for potential delays in performing the seek operation on the
	 * underlaying multimedia framework which mitigates the possibility of the highlight being updated to a stale
	 * position value.
	 * @private
	 */
	reenableProgressUpdatesDelay: 1000,
	
	/**
	 * Cache of the xy coordinates (top left) of the component, used to determine seek operation offsets.
	 * @private
	 */
	coordinates: [0, 0],
	
	/**
	 * @private
	 * Progress apply hook. Enforces a min progress value of 0, and a max
	 * progress value of 100. If the setProgress function is called with an
	 * invalid value, no errors are thrown, but the value will be adjusted to
	 * the min/max appropriately.
	 */
	applyProgress: function(value) {
		var progress = value;
		
		if(progress < 0)
		{
			progress = 0;
		}
		else if(progress > 100)
		{
			progress = 100;
		}
		
		return progress;
	},
	
	/**
	 * @private
	 * Progress update hook. Updates the display of the progress bar highlight
	 * based on the progress value.
	 */
	updateProgress: function(newProgress, oldProgress) {
		if(!this.disableProgressUpdates) {
			this.updateHighlight();
		}
	},
	
	/**
	 * seekable update hook. Registers or unregisters touch handlers to enable/disable seek behaviour.
	 * @param {Boolean} newVal The new seekable configuration value.
	 * @param {Boolean} oldVal The old seekable configuration value.
	 * @private
	 */
	updateSeekable: function(newVal, oldVal) {
		var seekListenersMap = {
				touchstart: this.onSeekStart,
				touchmove: this.onSeekMove,
				touchend: this.onSeekEnd,
				
				scope: this
			};
		
		if (newVal && !oldVal) {
			// seekable
			this.element.on(seekListenersMap);
		} else if(!newVal && oldVal) {
			// Not seekable
			this.element.un(seekListenersMap);
		}
	},
	
	/**
	 * Updates the highlight bar to reflect the current position.
	 * @private
	 */
	updateHighlight: function() {
		this.child('container[action="progressbarHighlight"]').element.setStyle('-webkit-transform', 'scale3d(' + (this.getProgress() / 100) + ', 1, 1)');
	},
	
	/**
	 * touchstart event handler. Starts a seek operation.
	 * @param e {Object} The Sencha touchstart event.
	 */
	onSeekStart: function(e) {
		this.coordinates = this.element.getXY();
		
		// Disable automatic highlight updates
		this.disableProgressUpdates = true;
		
		// Process the first touch event
		this.onSeekMove(e);
	},
	
	/**
	 * touchmove event handler. Updates the progress highlight based on the user's touch location and updates the
	 * progress value.
	 * @param e {Object} The Sencha touchmove event.
	 */
	onSeekMove: function(e) {
		var x = e.touch.point.x,
			progressBarX = this.coordinates[0],
			progressBarWidth = this.element.dom.offsetWidth,
			progress = Math.min((x - progressBarX) / progressBarWidth, 1) * 100;
		
		// Update the progress value
		this.setProgress(progress);
		
		// Manually update the highlight
		this.updateHighlight();
	},
	
	/**
	 * touchend event handler. Ends a seek operation, and fires the seek event with the
	 * new position.
	 * @param e {Object} The Sencha touchend event.
	 */
	onSeekEnd: function(e) {
		var me = this;

		// Apply the final touch event
		this.onSeekMove(e);
		
		// Re-enable the automatic highlight updates after a delay
		setTimeout(function() { me.disableProgressUpdates = false; }, this.reenableProgressUpdatesDelay);
		
		// Fire the seek event with the new progress value
		this.fireEvent('seek', this, this.getProgress());
	}
});