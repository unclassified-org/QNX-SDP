/**
 * The tuner slider for the mid-quality Radio view.
 * @author lgreenway@lixar.com
 *
 * $Id: Slider.js 6126 2013-04-29 20:58:48Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.radio.tuner.Slider', {
	extend: 'Ext.Component',
	xtype: 'radiotunerslider',
	
	requires: [
		
	],
	
	config: {
		html: '<div class="radiotunerslider">' +
					'<div class="thumb"></div>' +
				'</div>' + 
				'<div class="radiocurrentstation"></div>',

		scroll: false,
		
		// Custom properties
		/**
		 * @property
		 * Boolean value indicating whether the tuner dial control has been painted
		 * at least once. Gives an indication of whether jQuery selectors can be used
		 * to access elements.
		 */
		isPainted: false,
		
		/**
		 * @property {MediaPlayer.model.RadioTuner}
		 * The tuner information to use to render the dial/frequency list.
		 */
		tuner: undefined,

		/**
		 * @property
		 * This value is set to true whenever the tuner for the dial has changed
		 * so that when the first selected station is set, nothing will animate.
		 */
		isTunerInitializing: false,
		
		/**
		 * @property {Number}
		 * The currently selected radio station.
		 */
		selectedStation: 0,

		/**
		 * @property {Ext.dom.Element}
		 * Cached reference to the slider control element.
		 */
		sliderCtrl: null,		
		
		/**
		 * @property {Ext.dom.Element}
		 * Cached reference to the slider control thumb element.
		 */
		thumbCtrl: null,

		/**
		 * @property {Ext.dom.Element}
		 * Cached reference to the current station element.
		 */
		currentStationCtrl: null,

		/**
		 * @property {Number}
		 * Cached value for the x coordinate offset of the slider control. Used
		 * to determine where the slider thumb should be moved during a drag event
		 * or when the selected station changes.
		 */
		xOffset: 0,
		
		/**
		 * @property {Number}
		 * Stores the 'step' size of each frequency along the band.
		 */
		sliderStepSize: 0,
	},
	

	/**
	 * Initialization life cycle function handler. Binds touch events required for
	 * the tuner dial to function, and caches some data used for transforms for
	 * performance.
	 */
	initialize: function() {
		this.callParent(arguments);
		
		// Sencha virtual touch event processing can slow things down quite a bit, and we
		// don't rely on any of these to move the thumb along the slider. We'll stop the events
		// from propagating to save a bit of performance, and just use native javascript
		// events to handle the thumb dragging.
		this.element.onBefore('touchstart', function(e) { e.stopEvent(); });
		this.element.onBefore('touchmove', function(e) { e.stopEvent(); });
		this.element.onBefore('touchend', function(e) { e.stopEvent(); });
		
		// Here we register our native javascript event handlers
		this.element.down('.radiotunerslider').dom.addEventListener('touchstart', this.onTouchMove.bind(this));
		this.element.down('.radiotunerslider').dom.addEventListener('touchmove', this.onTouchMove.bind(this));
		this.element.down('.radiotunerslider').dom.addEventListener('touchend', this.onTouchEnd.bind(this));
		
		// Cache element references so they can be accessed with minimal overhead
		this.setSliderCtrl(this.element.down('.radiotunerslider'));
		this.setThumbCtrl(this.element.down('.thumb'));
		
		// Note that the reason why the current station information exists within the tuner slider
		// control is to allow us to modify the contents of the div element directly, without having
		// to traverse through Sencha's event system to modify a view component elsewhere in the radio
		// view. This is purely done for performance reasons, but certainly should not be considered as
		// a standard for inter-component information sharing.
		this.setCurrentStationCtrl(this.element.down('.radiocurrentstation'));
		
		// Because we're doing a bit of DOM manipulation to display the slider thumb in the corresponding
		// position for the selected frequency, as well as the selected frequency itself, we need to wait
		// for this view component to be 'painted' before we can start changing things.
		this.on('painted', function() {
			if(!this.getIsPainted())
			{
				this.setIsPainted(true);
	
				this.setXOffset(this.getSliderCtrl().getX());
				
				if(this.getTuner() instanceof MediaPlayer.model.RadioTuner)
				{
					this.calculateSliderStepSize();

					// Update the current station display. We assume this has already been set before
					// the painted event is fired.
					this.getCurrentStationCtrl().setHtml(this.getSelectedStation());

					// Update the slider thumb position
					this.updateThumbPosition();
				}
			}
		}, this)
	},

	/**
	* Update hook handler for the radio tuner dial's
	* {@link MediaPlayer.view.radio.TunerDial#tuner tuner property}.
	* @param {Mixed} value The new value of the {@link MediaPlayer.model.RadioTuner RadioTuner} instance.
	* @param {Mixed} oldValue The old value of the {@link MediaPlayer.model.RadioTuner RadioTuner} instance.
	* @method
	*/
	updateTuner: function(value, oldValue) {
		if(value instanceof MediaPlayer.model.RadioTuner)
		{
			if(this.getIsPainted())
			{
				this.calculateSliderStepSize();
			}
		}
	},

	/**
	 * Calculates the 'step' size of each frequency in the band, relative to the width of the
	 * slider control, and then updates the sliderStepSize proeprty with the value.
	 */
	calculateSliderStepSize: function() {
		var totalRange = this.getTuner().data.rangeMax - this.getTuner().data.rangeMin;
		var totalSteps = totalRange / this.getTuner().data.rangeStep;
		var sliderStep = (this.getSliderCtrl().getWidth() - this.getThumbCtrl().getWidth()) / totalSteps;
		
		this.setSliderStepSize(sliderStep);
	},

	/**
	 * Determines the selected station based on the x coordinate of the slider thumb control.
	 * @return {Number} The selected station.
	 */
	calculateSelectedStation: function() {
		var currentStep = Math.round((this.getThumbCtrl().getX() - this.getXOffset()) / this.getSliderStepSize());
		return this.getTuner().data.rangeMin + (currentStep * this.getTuner().data.rangeStep);
	},

	/**
	 * Update hook handler for the selectedStation property. Rotates the dial and scrolls
	 * the frequency list to the selected station.
	 * @param {Number} value The new selected station value
	 * @param {Number} oldValue The old selected station value
	 */
	updateSelectedStation: function(value, oldValue) {
		if(this.getIsPainted() &&
			this.getTuner() instanceof MediaPlayer.model.RadioTuner)
		{
			// Update the current station display
			this.getCurrentStationCtrl().setHtml(value);
			
			// Update the slider thumb position
			this.updateThumbPosition();
		}
	},
	
	/**
	 * Updates the position of the slider thumb control based on the selectedStation property. This
	 * function is called automatically every time the selectedStation property is updated.
	 */
	updateThumbPosition: function() {
		// Determine where the thumb should be positioned based on the selected station
		var newX = this.getSliderStepSize() * ((this.getSelectedStation() - this.getTuner().data.rangeMin) / this.getTuner().data.rangeStep);
		this.getThumbCtrl().setStyle('-webkit-transform', 'translate3d(' + newX + 'px, 0, 0)');
	},

	/**
	 * Touch move handler for the slider thumb control. Updates the position of the thumb along
	 * with the position of the touch event.
	 * @param {Event} e Touch event.
	 */
	onTouchMove: function(e) {
		var thumbWidth = this.getThumbCtrl().getWidth();
		var sliderWidth = this.getSliderCtrl().getWidth();
		
		var newX = (e.touches[0].pageX - this.getXOffset() - (thumbWidth / 2));
		if(newX < 0)
		{
			newX = 0;
		}
		else if(newX > this.getSliderCtrl().getWidth() - thumbWidth)
		{
			newX = sliderWidth - thumbWidth;
		}

		// Move the thumb control to its position
		this.getThumbCtrl().setStyle('-webkit-transform', 'translate3d(' + newX + 'px, 0, 0)');

		// Calculate what the current station would be based on the position of the
		// thumb along the slider bar.
		var station = this.calculateSelectedStation();
			
		// Update the current station display if the station it's displaying has changed
		// (prevents unnecessary DOM updates).
		if(this.getCurrentStationCtrl().getHtml() != station)
		{
			// Note: Comment this line out to prevent the current station from being 'live' updated.
			// This significantly increases the performance of the tuner slider thumb due to the lack
			// of addition JavaScript processing, DOM manipulation, and subsequent layout/rendering.
			this.getCurrentStationCtrl().setHtml(station);
		}
			
		// Note: Here is how we would typically notify the rest of the application that something has
		// changed and allow interested parties react to this change.
		// this.fireEvent('livestationchange', {'station': this.calculateSelectedStation()});
		e.preventDefault();
		e.stopPropagation();
		
		return false;
	},

	/**
	 * Touch end handler for the slider thumb control. Determines the selected station based
	 * on the ending position of the thumb, updates the selectedStation property, and then fires
	 * a 'stationchange' event containing the newly selected station.
	 * @param {Event} e Touch event.
	 */
	onTouchEnd: function(e) {
		var station = this.calculateSelectedStation();
		
		this.setSelectedStation(station);
		
		this.fireEvent('stationchange', {station: station});
	},
});