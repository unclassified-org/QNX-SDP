/**
 * The tuner dial for the radio view
 * @author lgreenway@lixar.com
 *
 * $Id: Dial.js 7058 2013-08-30 17:21:50Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.view.radio.tuner.Dial', {
	extend: 'Ext.Container',
	xtype: 'radiotunerdial',
	
	requires: [
		
	],
	
	statics: {
		/**
		 * Commonly-used multiplier to convert radians to degrees. Stored as constant
		 * for performance purposes.
		 */
		RAD_TO_DEG_MULTIPLIER: 180 / Math.PI
	},
	
	config: {
		scroll: false,
		cls: 'radio-tunerDial',
		
		// Custom properties
		/**
		 * @property {MediaPlayer.model.RadioTuner}
		 * The tuner information to use to render the dial/frequency list.
		 */
		tuner: undefined,

		/**
		 * @property {Number}
		 * The currently selected radio station.
		 */
		selectedStation: 0,
		
		/**
		 * @property {Number}
		 * The number of rotation deltas to store for velocity calculations.
		 */
		maxLastRotateDeltas: 6,
		
		/**
		 * @property {Number}
		 * The divident, in milliseconds, used to calculate the weight of drag deltas.
		 * Any deltas that occur within the specified number of milliseconds are given
		 * more weight than those that occur after the specified number of milliseconds.
		 */
		deltaWeightDividend: 150,
		
		/**
		 * @property
		 * Multiplier constant to use to calculate rotational velocity.
		 */
		velocityMultiplier: 1,
		
		/**
		 * @property
		 * Transition time multiplier.
		 */
		transitionTimeMultiplier: 5,
		
		/**
		 * @property
		 * Minimum transition time in milliseconds.
		 */
		minTransitionTime: 100,
		
		/**
		 * @property
		 * The number of degrees for each 'step' of the dial control. A rotation of the
		 * dial by this many degrees equals one change in the frequency/channel.
		 */
		tunerCtrlAngleStep: 10,
	
		html: '<div class="radiotunerdial">' +
				'<div class="frequencyListContainer">' +
					'<ul class="frequencies">' +
					'</ul>' +
				'</div>' +
				'<div class="overlay">' +
				'</div>' +
				'<div class="dial"></div>' +
			'</div>',
	},

	/**
	 * @private
	 * @property {Boolean}
	 * Boolean value indicating whether the tuner dial control has been painted
	 * at least once. Gives an indication of whether jQuery selectors can be used
	 * to access elements.
	 */
	painted: false,
	
	/**
	 * @private
	 * @property {Boolean}
	 * This value is set to true whenever the tuner for the dial has changed
	 * so that when the first selected station is set, nothing will animate.
	 */
	isTunerInitializing: false,
	
	/**
	 * @private
	 * @property {Boolean}
	 * Indicates whether the tuner dual is actively being rotated.
	 */
	isTunerRotating: false,
	
	/**
	 * @private
	 * @property {Boolean}
	 * Boolean value indication whether the tuner dial/frequency list is currently
	 * animating.
	 */
	isTunerAnimating: false,

	/**
	 * @private
	 * @property {Number}
	 * The starting angle of the tuner dial at the beginning of a drag gesture.
	 */
	dialStartAngle: 0,
	
	/**
	 * @private
	 * @property {Number}
	 * The starting angle of the touch relative to the dial centre coordinates
	 * at the beginning of a drag gesture.
	 */
	touchStartAngle: 0,

	/**
	 * @private
	 * @property {Number}
	 * Stores the current rotation of the dial control. This property should
	 * not be modified from outside of the tuner dial component.
	 */
	currentRotation: 0,

	/**
	 * @private
	 * @property {Array}
	 * Stores the last few rotation deltas to determine spin velocity on touch
	 * release.
	 */
	lastRotateDeltas: [],
	
	/**
	 * @private
	 * @property {Number}
	 * Cached value of the frequency list LI element line height, used for position
	 * calculations of the frequency lists.
	 */
	frequencyListItemLineHeight: 0,
	
	/**
	 * @private
	 * @property {Number}
	 * The number of degrees the tuner dial must rotate for the
	 * frequency list to be scrolled through entirely (with wrapping),
	 * e.g. 87.5 through to 87.5.
	 */
	fullFrequencyListScrollDegrees: 0,
	
	/**
	 * @private
	 * @property {Element}
	 * Cached dial element.
	 */
	dialElement: null,
	
	/**
	 * Initialization life cycle function handler. Binds touch events required for
	 * the tuner dial to function, and caches some data used for transforms for
	 * performance.
	 */
    initialize: function() {
        this.callParent(arguments);

		this.on('painted', this.onPainted, this);

        this.element.on('touchstart', this.onTouchStart, this);
        this.element.on('touchmove', this.onTouchMove, this);
        this.element.on('touchend', this.onTouchEnd, this);
    },

    onPainted: function() {
		// If this is the first time the tuner dial is painted, then we need to make sure the dial
		// and frequency lists are drawn since we can now be assured that the elements required
		// for the functions exist in the DOM, ready for jQuery to select them.
		if(this.painted == false)
		{
			// Set the painted flag to true
			this.painted = true;

			// Cache the dial element
			this.dialElement = $('.radiotunerdial .dial');
			
			// Cache the dial width and height values for performance reasons
			this.cacheDialDimensions();
			
			if(this.getTuner() instanceof MediaPlayer.model.RadioTuner)
			{
				// Means we should initialize the tuner
				this.initializeBandFrequencyList();
				
				// Re-select the selected station so the dial/frequency list update appropriately.
				// Since the update hook for selected station doesn't fire unless there's an actual
				// change in the selectedStation value, we're going to reset it to the tuner's min
				// value first, and then set it back so that the update hook fires.
				var station = this.getSelectedStation();
				this.setSelectedStation(this.getTuner().data.rangeMin);
				this.setSelectedStation(station);
			}
		}
    },
    
    /**
     * Reinitializes the dial so that all the appropriate calculations can be applied to setup the UI correctly
     */
	onThemeUpdate: function() {
		this.cacheDialDimensions();
		this.initializeBandFrequencyList();
		this.updateSelectedStation(this.getSelectedStation(), null);
	},

	/**
	 * @private
	 * Caches the radio dial width, height, offset and centre coordinates for performance reasons. 
	 */
	cacheDialDimensions: function() {
		if(this.painted) {
			this.dialElement.data('offset', this.dialElement.offset());
			this.dialElement.data('height', this.dialElement.height());
			this.dialElement.data('width', this.dialElement.width());
			
			// Store the centre coordinates for the dial
			var controlCentreX = this.dialElement.data('offset').left + (this.dialElement.data('width') / 2),
				controlCentreY = this.dialElement.data('offset').top + (this.dialElement.data('height') / 2);

			this.dialElement.data('centre', { x: controlCentreX, y: controlCentreY });
		}
	},
	
    /**
	 * @private
	 * Update hook handler for the radio tuner dial's
	 * {@link MediaPlayer.view.radio.TunerDial#tuner tuner property}.
	 * @param {Mixed} value The new value of the {@link MediaPlayer.model.RadioTuner RadioTuner} instance.
	 * @param {Mixed} oldValue The old value of the {@link MediaPlayer.model.RadioTuner RadioTuner} instance.
	 * @method
	 */
  	updateTuner: function(value, oldValue) {
		if(value instanceof MediaPlayer.model.RadioTuner)
		{
			// If either the old value doesn't exist, or if there was a change in any of the
			// properties between the two values, then we need to redraw the frequency list
			// for the tuner dial.
			var propertiesChanged = false;

			if(oldValue == undefined || oldValue instanceof MediaPlayer.model.RadioTuner === false)
			{
				propertiesChanged = true;
			}
			else if(oldValue instanceof MediaPlayer.model.RadioTuner)
			{
				for(var i in value.raw)
				{
					if(value.raw[i] != oldValue.raw[i])
					{
						propertiesChanged = true;
					}
				}
			}
			
			if(propertiesChanged)
			{
				this.initializeBandFrequencyList();
			}
		}
	},

	/**
	 * @private
	 * Update hook handler for the selectedStation property. Rotates the dial and scrolls
	 * the frequency list to the selected station.
	 * @param {Number} value The new selected station value
	 * @param {Number} oldValue The old selected station value
	 */
    updateSelectedStation: function(value, oldValue) {
    	// Only bother with this process if this control has actually been painted, otherwise
    	// none of this will work since we rely on jQuery to determine where the dial should be
    	// rotated to, and where the frequency list should be translated to.
    	
    	if(this.painted)
    	{
	    	// We'll use the calculated value versus the oldValue since it's possible
	    	// that the dial was updated by dragging, which means that the oldValue is no
	    	// longer correct.	
	    	var currentValue = this.calculateSelectedFrequency();
	
	    	if(typeof(this.getTuner()) != 'undefined' &&
	    		value != currentValue)
			{
				// Store the new rotation value in here
				var newValue = 0;
				
				if(value > currentValue)
				{
					var clockwiseOffset = (((this.getTuner().data.rangeMax - value) + (currentValue - this.getTuner().data.rangeMin) + this.getTuner().data.rangeStep) / this.getTuner().data.rangeStep) * this.getTunerCtrlAngleStep(); 
					var counterClockwiseOffset = ((value - currentValue) / this.getTuner().data.rangeStep) * this.getTunerCtrlAngleStep(); 
					
					if(clockwiseOffset <= counterClockwiseOffset)
					{
						newValue = this.currentRotation + clockwiseOffset;
					}
					else
					{
						newValue = this.currentRotation - counterClockwiseOffset;
					}
				}
				else if(value < currentValue)
				{
					var clockwiseOffset = ((currentValue - value) / this.getTuner().data.rangeStep) * this.getTunerCtrlAngleStep(); 
					
					var counterClockwiseOffset = (((this.getTuner().data.rangeMax - currentValue) + (value - this.getTuner().data.rangeMin) + this.getTuner().data.rangeStep) / this.getTuner().data.rangeStep) * this.getTunerCtrlAngleStep(); 
					
					if(clockwiseOffset <= counterClockwiseOffset)
					{
						newValue = this.currentRotation + clockwiseOffset;
					}
					else
					{
						newValue = this.currentRotation - counterClockwiseOffset;
					}
				}
				
				// To prevent exponential numbers we'll operate within a fixed range of decimal places
				newValue = parseFloat(newValue.toFixed(4));
				
				if(this.isTunerInitializing == false)
				{
					this.dialElement.css('-webkit-transition','-webkit-transform ' + Math.abs((newValue - this.currentRotation) * this.getTransitionTimeMultiplier()) + 'ms ease-out');
					$('.radiotunerdial .frequencyListContainer ul').css('-webkit-transition','-webkit-transform ' + Math.abs((newValue - this.currentRotation) * this.getTransitionTimeMultiplier()) + 'ms ease-out');
				}
				else
				{
					this.isTunerInitializing = false;
				}
				
				this.dialElement.css('-webkit-transform','rotate(' + newValue + 'deg)');
	
				// Reset the smoothing transition once it's complete
				setTimeout(this.resetSmoothingTransition.bind(this), Math.abs((newValue - this.currentRotation) * this.getTransitionTimeMultiplier()));
	
				// Prevent exponential numbers from being stored for the current rotation value, too
				this.currentRotation = parseFloat(newValue.toFixed(4));
	
				this.translateFrequencyListPosition();
			}
    	}
    },
    
	/**
	 * @private
	 * Initializes the tuner dial's rotation and frequency list. This function is called
	 * automatically whenever the tuner for this control changes.
	 */
	initializeBandFrequencyList: function() {
		document.body.offsetWidth = document.body.offsetWidth;
		// Again, this only matters if this control has been painted.
		if(this.painted)
		{
			// Indicate that the tuner dial is having its view initialized, so we can know
			// to disable fancy transition effects while we set the selected station for
			// the first time.
			this.isTunerInitializing = true;
	
			// Reset the rotation of the dial
			this.dialElement.css('-webkit-transform','rotate(0deg)');
			this.currentRotation = 0;
	
			var frequencyListContainer = $('.radiotunerdial .frequencyListContainer'); 		
			
			// Remove existing lists
			frequencyListContainer.empty();
			
			// Create the new list
			var frequencyList = $('<ul class="frequencies"></ul>');

			// Add the frequency elements
			var listItems = '';
			for(var i = this.getTuner().data.rangeMin; i.toFixed(1) <= this.getTuner().data.rangeMax; i += this.getTuner().data.rangeStep)
			{
				listItems += '<li>' + (this.getTuner().data.rangeStep < 1 ? i.toFixed(1) : i) + '</li>'; 
			}
			frequencyList.append(listItems);
			
			// Add the new list to the container
			frequencyListContainer.append(frequencyList);
			
			// Now we make another copy of the frequency list to make the lists look continuous
			// as the user scrolls through.
			frequencyListContainer.prepend(frequencyList.clone());

			// Get the line height of the station list LI elements so we
			// can cache the data to use with the Y transform to scroll the list
			// along with the tuner dial
			this.frequencyListItemLineHeight = parseInt($('.radiotunerdial ul.frequencies li').first().css('line-height'));
			
			// We need to calculate how many degrees the tuner dial needs to rotate in order
			// to scroll through the entire frequency list for this band.
			this.fullFrequencyListScrollDegrees = (((this.getTuner().data.rangeMax - this.getTuner().data.rangeMin + this.getTuner().data.rangeStep) / this.getTuner().data.rangeStep) * this.getTunerCtrlAngleStep()).toFixed(2);

			// Stack the frequency lists, and initialize their offsetY values
			// which is used to determine when they should be repositioned to
			// facilitate infinite scrolling.
			var frequencyListItemHeight = this.frequencyListItemLineHeight;	// Scope reasons
			$('.frequencies').each(function(i, ctrl) {
				$(ctrl).data('offsetY', ((i-1)*($('li', this).length * frequencyListItemHeight)));
				$(this).css('-webkit-transform', 'translate3d(0px, ' + $(ctrl).data('offsetY') + 'px, 0px)');
				
				// Cache the height of the list so it doesn't have to be calculated on each touchmove event
				$(ctrl).data('height', $(ctrl).height());
			});
		}
	},

    /**
	 * @private
     * Touch start handler for the dial control. Restores smoothing transition for dial
     * and frequency lists, and prepares the dial for rotation.
     * @param {Event} e Touch event.
     */
	onTouchStart: function(e) {
		if(!this.isTunerAnimating)
		{
			this.isTunerRotating = true;
	
			// Restore a smoothing transition
			this.resetSmoothingTransition();
	
			// Store the angle of the touch at the start of the rotation, relative to the image centre
			var touchStartXFromCentre = e.pageX - this.dialElement.data('centre').x;
			var touchStartYFromCentre = e.pageY - this.dialElement.data('centre').y;
			this.touchStartAngle = Math.atan2(touchStartYFromCentre, touchStartXFromCentre) * this.statics().RAD_TO_DEG_MULTIPLIER;
		
			// Store the current rotation angle of the image at the start of the rotation
			this.dialStartAngle = this.currentRotation;
		}
	},

	/**
	 * @private
	 * Touch move event handler for the dial control. Handles the rotation of the dial based
	 * on the position of the touch event relative to where the touch gesture began. Also
	 * calls an update method to ensure the frequency list is scrolled along with the dial.
	 * @param {Event} e Touch event.
	 */
	onTouchMove: function(e) {
		if(this.isTunerRotating)
		{
			// Calculate the angle of the touch from the centre of the dial
			var touchXFromCentre = e.pageX - this.dialElement.data('centre').x;
			var touchYFromCentre = e.pageY - this.dialElement.data('centre').y;
			var touchAngle = Math.atan2(touchYFromCentre, touchXFromCentre) * this.statics().RAD_TO_DEG_MULTIPLIER;
		
			// Calculate the new rotation angle for the dial
			var rotateAngle = (touchAngle - this.touchStartAngle + this.dialStartAngle);

			// Store the rotation deltas for velocity
			this.lastRotateDeltas.push({ angle: this.currentRotation - rotateAngle, time: (new Date()).getTime() });
			if(this.lastRotateDeltas.length > this.getMaxLastRotateDeltas())
			{
				this.lastRotateDeltas.shift();
			}
		
			// Rotate the image to the new angle and store the current rotation value so we
			// can calculate the delta on the next touchmove event
			this.dialElement.css('-webkit-transform','rotate(' + rotateAngle + 'deg)');
			this.currentRotation = rotateAngle;

			this.translateFrequencyListPosition();
		}
	},

	/**
	 * @private
	 * Touch end event handler for the dial control. Calculates swipe velocity if applicable
	 * and sets the selected frequency based on where the dial will end up.
	 * @param {Event} e Touch event.
	 */
	onTouchEnd: function(e) {
		// Determine swipe velocity and target frequency
		if(this.lastRotateDeltas.length > 0)
		{
			// Set the animating flag to true to prevent user interaction while the transition resolves
			this.isTunerAnimating = true;
			
			var velocity = 0,
				weight = 0,	// The weight given to this move event based on when it occurred
				releaseTime = (new Date()).getTime();
			for(var i = this.lastRotateDeltas.length - 1; i >= 0; i--)
			{
				weight = this.getDeltaWeightDividend() / (releaseTime - this.lastRotateDeltas[i].time);
				velocity += (this.lastRotateDeltas[i].angle * Math.min(weight, 1));
			}
			velocity = velocity / this.lastRotateDeltas.length;
			
			velocity = (velocity < 0 ? 1 : -1) * Math.pow(velocity, 2) * this.getVelocityMultiplier();
	
			// Cap the maximum velocity to a half list rotation		
			if(Math.abs(velocity) > this.fullFrequencyListScrollDegrees / 2)
			{
				velocity = (this.fullFrequencyListScrollDegrees / 2) * (velocity < 0 ? -1 : 1);
			}
			
			var transitionTime = Math.max(this.getMinTransitionTime(), Math.abs(velocity * this.getTransitionTimeMultiplier()));
			this.dialElement.css('-webkit-transition','-webkit-transform ' + transitionTime + 'ms ease-out');
			$('.radiotunerdial .frequencyListContainer ul').css('-webkit-transition','-webkit-transform ' + transitionTime + 'ms ease-out');
			
			// Make sure to reset the smoothing transition style once the animation is complete
			setTimeout(this.resetSmoothingTransition.bind(this), transitionTime);
			
			// Make sure to remove the animating flag once the transition is complete
			setTimeout(function() {
				this.isTunerAnimating = false;
			}.bind(this), transitionTime);
			
			this.currentRotation += velocity;
			
			// Reset the velocity array
			this.lastRotateDeltas = [];
		}
		
		
		// Figure out how far off we are from the control snap radian values	
		var angleSnapOffset = this.currentRotation % this.getTunerCtrlAngleStep();
		
		// Determine what the new rotation value will be in degrees
		var newRotation = this.currentRotation;
		
		if(angleSnapOffset > 0) {
			if(angleSnapOffset <= this.getTunerCtrlAngleStep() / 2) {
				// Snap up
				newRotation = newRotation - angleSnapOffset;
			} else {
				// Snap down
				newRotation = newRotation + (this.getTunerCtrlAngleStep() - angleSnapOffset);
			}
		} else {
			if(Math.abs(angleSnapOffset) <= this.getTunerCtrlAngleStep() / 2) {
				// Snap up
				newRotation = newRotation + Math.abs(angleSnapOffset);
			} else {
				// Snap down
				newRotation = newRotation - (this.getTunerCtrlAngleStep() - Math.abs(angleSnapOffset));
			}
		}

		// Rotate the dial and update the current rotation value		
		this.dialElement.css('-webkit-transform','rotate(' + newRotation + 'deg)');
		this.currentRotation = newRotation;
		
		// Update the y transform of the frequency list so that the corresponding frequency
		// is shown
		this.translateFrequencyListPosition();
		
		// Fire an event notifying that the selected station has changed
		this.fireEvent('stationchange', {station: this.calculateSelectedFrequency()});

		this.isTunerRotating = false;
	},

	/**
	 * @private
	 * Resets the dial and frequency list smoothing webkit-transition properties.
	 */
	resetSmoothingTransition: function() {
		this.dialElement.css('-webkit-transition','-webkit-transform 50ms linear');
		$('.radiotunerdial .frequencyListContainer ul').css('-webkit-transition','-webkit-transform 50ms linear');
	},

	/**
	 * @private
	 * Updates the y position of the frequency list controls relative to the rotation
	 * of the dial. This function also ensures that the lists 'wrap' once they've gone too far
	 * from what the user can see, so that the list scrolls infinitely.
	 */
	translateFrequencyListPosition: function() {
		// Determine the new Y coordinate for the lists
		var newY = (this.currentRotation/this.getTunerCtrlAngleStep()) * this.frequencyListItemLineHeight;

		// Need to translate each of the frequency ULs separately
		$('.radiotunerdial ul.frequencies').each(function(i, ctrl) {
			var listWrapped = false,
				transitionStyle = '';

			// Determine if we need to wrap the top most or bottom most lists so that the
			// list remains continuous
			if($(ctrl).data('offsetY') + newY > $(ctrl).data('height') * 0.5)
			{
				listWrapped = true;
				
				// Get rid of the transition since it's not needed as the list is moved to
				// its new offset
				transitionStyle = $(ctrl).css('-webkit-transition');
				$(ctrl).css('-webkit-transition', 'none');

				// Shove the list off to the side so that any pending transition animations don't
				// cause the thing to slide over the currently-displayed list while it's being
				// transitioned to its new offset 
				$(this).css('-webkit-transform', 'translate3d(-10000px, ' + $(ctrl).data('offsetY') + 'px, 0px)');

				// Update the offset data for this list
				$(ctrl).data('offsetY', $(ctrl).data('offsetY') - ($(ctrl).data('height') * 2));
			}
			else if($(ctrl).data('offsetY') + newY < ($(ctrl).data('height') * 1.5) * -1)
			{
				listWrapped = true;
				
				transitionStyle = $(ctrl).css('-webkit-transition');
				$(ctrl).css('-webkit-transition', 'none');
				$(this).css('-webkit-transform', 'translate3d(-10000px, ' + $(ctrl).data('offsetY') + 'px, 0px)');

				$(ctrl).data('offsetY', $(ctrl).data('offsetY') + ($(ctrl).data('height') * 2));
			}

			var cssObj = {
				'-webkit-transform': 'translate3d(0px, ' + (($(ctrl).data('offsetY') + newY).toFixed(2)) + 'px, 0px)'
			};

			// Restore the transition and its visibility
			if(listWrapped)
			{
				cssObj['-webkit-transition'] = transitionStyle;
			}
			
			// Finally, apply the transform to scroll this list along with the dial
			$(this).css(cssObj);
		});
	},
	
	/**
	 * @private
	 * Determines which frequency is currently selected based on the rotation of the dial,
	 * taking into account frequency list wrapping.
	 * @return {Number} The selected frequency.
	 */
	calculateSelectedFrequency: function() {
		var selectedFrequency = 0;
		
		if(typeof(this.getTuner()) != 'undefined')
		{
			// Now we need to determine which frequency we've ended up at
			var scrollPosition = this.currentRotation % this.fullFrequencyListScrollDegrees;
			
			// If we're rotated clockwise from zero, we need to invert the scroll position as we're
			// decrementing the frequency versus incrementing
			if(scrollPosition > 0)
			{
				scrollPosition = this.fullFrequencyListScrollDegrees - scrollPosition;
			}
			else
			{
				scrollPosition = Math.abs(scrollPosition);
			}
	
			selectedFrequency = this.getTuner().data.rangeMin + ((scrollPosition / this.getTunerCtrlAngleStep()) * this.getTuner().data.rangeStep);
		}

		return selectedFrequency;
	},

});