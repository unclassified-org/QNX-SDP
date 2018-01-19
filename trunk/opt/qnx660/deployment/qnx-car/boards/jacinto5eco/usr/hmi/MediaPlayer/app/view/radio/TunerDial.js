/**
 * The tuner dial for the radio view
 * @author lgreenway@lixar.com
 *
 * $Id: TunerDial.js 2475 2012-05-14 20:43:55Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.view.radio.TunerDial', {
	extend: 'Ext.Container',
	xtype: 'radiotunerdial',
	
	requires: [
		
	],
	
	config: {
		scroll: false,
		cls: 'radio-tunerDial',
		
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
		 * @property {Number}
		 * Stores the current rotation of the dial control. This property should
		 * not be modified from outside of the tuner dial component.
		 */
		currentRotation: 0,

		/**
		 * @property {Object}
		 * Stores the centre x and y coordinates of the dial control. This property
		 * should not be modified from outside of the tuner dial component.
		 */
		centreCoordinates: {},

		/**
		 * @property {Number}
		 * The number of rotation deltas to store for velocity calculations.
		 */
		maxLastRotateDeltas: 6,
		
		/**
		 * @property {Array}
		 * Stores the last few rotation deltas to determine spin velocity on touch
		 * release.
		 */
		lastRotateDeltas: [],
		
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
		 * Indicates whether the tuner dual is actively being rotated.
		 */
		isTunerRotating: false,
		
		/**
		 * @property
		 * Boolean value indication whether the tuner dial/frequency list is currently
		 * animating.
		 */
		isTunerAnimating: false,

		/**
		 * @property
		 * The starting angle of the tuner dial at the beginning of a drag gesture.
		 */
		tunerStartAngle: 0,
		
		/**
		 * @property
		 * The starting angle of the touch relative to the dial centre coordinates
		 * at the beginning of a drag gesture.
		 */
		touchStartAngle: 0,
		
		/**
		 * @property
		 * The number of degrees for each 'step' of the dial control. A rotation of the
		 * dial by this many degrees equals one change in the frequency/channel.
		 */
		tunerCtrlAngleStep: 10,
	
		/**
		 * @property
		 * Cached value of the frequency list LI element line height, used for position
		 * calculations of the frequency lists.
		 */
		frequencyListItemLineHeight: 0,
		
		/**
		 * The number of degrees the tuner dial must rotate for the
		 * frequency list to be scrolled through entirely (with wrapping),
		 * e.g. 87.5 through to 87.5.
		 */
		fullFrequencyListScrollDegrees: 0,
		
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
	 * Initialization life cycle function handler. Binds touch events required for
	 * the tuner dial to function, and caches some data used for transforms for
	 * performance.
	 */
    initialize: function() {
    	// Bind event listener for any theme updates
    	QnxCar.System.Theme.on(QnxCar.System.Theme.E_THEME_CHANGED, this.onThemeUpdate.bind(this));

        this.callParent(arguments);

		var thisExtObj = this;

		this.on('painted', function() {
			// If this is the first time the tuner dial is painted, then we need to make sure the dial
			// and frequency lists are drawn since we can now be assured that the elements required
			// for the functions exist in the DOM, ready for jQuery to select them.
			if(this.getIsPainted() == false)
			{
				this.setIsPainted(true);

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
		}, this);

        this.element.on('touchstart', this.onTouchStart, this);
        this.element.on('touchmove', this.onTouchMove, this);
        this.element.on('touchend', this.onTouchEnd, this);
    },

    /**
     * Reinitializes the dial so that all the appropriate calculations can be applied to setup the UI correctly
     */
	onThemeUpdate: function() {
		this.initializeBandFrequencyList();
		this.updateSelectedStation(this.getSelectedStation(), null);
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
	 * Update hook handler for the selectedStation property. Rotates the dial and scrolls
	 * the frequency list to the selected station.
	 * @param {Number} value The new selected station value
	 * @param {Number} oldValue The old selected station value
	 */
    updateSelectedStation: function(value, oldValue) {
    	// Only bother with this process if this control has actually been painted, otherwise
    	// none of this will work since we rely on jQuery to determine where the dial should be
    	// rotated to, and where the frequency list should be translated to.
    	
    	if(this.getIsPainted())
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
						newValue = this.getCurrentRotation() + clockwiseOffset;
					}
					else
					{
						newValue = this.getCurrentRotation() - counterClockwiseOffset;
					}
				}
				else if(value < currentValue)
				{
					var clockwiseOffset = ((currentValue - value) / this.getTuner().data.rangeStep) * this.getTunerCtrlAngleStep(); 
					
					var counterClockwiseOffset = (((this.getTuner().data.rangeMax - currentValue) + (value - this.getTuner().data.rangeMin) + this.getTuner().data.rangeStep) / this.getTuner().data.rangeStep) * this.getTunerCtrlAngleStep(); 
					
					if(clockwiseOffset <= counterClockwiseOffset)
					{
						newValue = this.getCurrentRotation() + clockwiseOffset;
					}
					else
					{
						newValue = this.getCurrentRotation() - counterClockwiseOffset;
					}
				}
				
				// To prevent exponential numbers we'll operate within a fixed range of decimal places
				newValue = parseFloat(newValue.toFixed(4));
				
				if(this.getIsTunerInitializing() == false)
				{
					$('.radiotunerdial .dial').css('-webkit-transition','all ' + Math.abs((newValue - this.getCurrentRotation()) * this.getTransitionTimeMultiplier()) + 'ms ease-out');
					$('.radiotunerdial .frequencyListContainer ul').css('-webkit-transition','all ' + Math.abs((newValue - this.getCurrentRotation()) * this.getTransitionTimeMultiplier()) + 'ms ease-out');
				}
				else
				{
					this.setIsTunerInitializing(false);
				}
				
				$('.radiotunerdial .dial').css('-webkit-transform','rotate(' + newValue + 'deg)');
	
				// Reset the smoothing transition once it's complete
				setTimeout(this.resetSmoothingTransition, Math.abs((newValue - this.getCurrentRotation()) * this.getTransitionTimeMultiplier()));
	
				// Prevent exponential numbers from being stored for the current rotation value, too
				this.setCurrentRotation(parseFloat(newValue.toFixed(4)));
	
				this.translateFrequencyListPosition();
			}
    	}
    },
    
	/**
	 * Initializes the tuner dial's rotation and frequency list. This function is called
	 * automatically whenever the tuner for this control changes.
	 */
	initializeBandFrequencyList: function() {
		document.body.offsetWidth = document.body.offsetWidth;
		// Again, this only matters if this control has been painted.
		if(this.getIsPainted())
		{
			// Indicate that the tuner dial is having its view initialized, so we can know
			// to disable fancy transition effects while we set the selected station for
			// the first time.
			this.setIsTunerInitializing(true);
	
			// Reset the rotation of the dial
			$('.radiotunerdial .dial').css('-webkit-transform','rotate(0deg)');
			this.setCurrentRotation(0);
	
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
			this.setFrequencyListItemLineHeight(parseInt($('.radiotunerdial ul.frequencies li').first().css('line-height')));
			
			// We need to calculate how many degrees the tuner dial needs to rotate in order
			// to scroll through the entire frequency list for this band.
			this.setFullFrequencyListScrollDegrees((((this.getTuner().data.rangeMax - this.getTuner().data.rangeMin + this.getTuner().data.rangeStep) / this.getTuner().data.rangeStep) * this.getTunerCtrlAngleStep()).toFixed(2));

			// Stack the frequency lists, and initialize their offsetY values
			// which is used to determine when they should be repositioned to
			// facilitate infinite scrolling.
			var frequencyListItemHeight = this.getFrequencyListItemLineHeight();	// Scope reasons
			$('.frequencies').each(function(i, ctrl) {
				$(ctrl).data('offsetY', ((i-1)*($('li', this).length*frequencyListItemHeight)));
				$(this).css('-webkit-transform', 'translate3d(0px, ' + $(ctrl).data('offsetY') + 'px, 0px)');
			});
		}
	},

    /**
     * Touch start handler for the dial control. Restores smoothing transition for dial
     * and frequency lists, and prepares the dial for rotation.
     * @param {Event} e Touch event.
     */
	onTouchStart: function(e) {
		if(this.getIsTunerAnimating() == false)
		{
			this.setIsTunerRotating(true);
	
			// Get the tuner control
			var tunerCtrl = $('.radiotunerdial');
			var tunerDial = $('.dial', tunerCtrl);
	
			// Restore a smoothing transition
			this.resetSmoothingTransition();
	
			// Store the center coordinates for the dial
			var controlOffset = tunerDial.offset();
			var controlCentreX = controlOffset.left + (tunerDial.width() / 2);
			var controlCentreY = controlOffset.top + (tunerDial.height() / 2);
			this.setCentreCoordinates({x: controlCentreX, y: controlCentreY});
	
			// Store the angle of the touch at the start of the rotation, relative to the image centre
			// If the centreCoordinates data is not present, we'll init it - this should only happen
			// once for performance reasons.
			var touchStartXFromCentre = e.pageX - this.getCentreCoordinates().x;
			var touchStartYFromCentre = e.pageY - this.getCentreCoordinates().y;
			this.setTouchStartAngle(Math.atan2(touchStartYFromCentre, touchStartXFromCentre) * (180 / Math.PI));
		
			// Store the current rotation angle of the image at the start of the rotation
			this.setTunerStartAngle(this.getCurrentRotation());
		}
	},

	/**
	 * Touch move event handler for the dial control. Handles the rotation of the dial based
	 * on the position of the touch event relative to where the touch gesture began. Also
	 * calls an update method to ensure the frequency list is scrolled along with the dial.
	 * @param {Event} e Touch event.
	 */
	onTouchMove: function(e) {
		if(this.getIsTunerRotating() == true)
		{
			// Calculate the angle of the touch from the centre of the dial
			var touchXFromCentre = e.pageX - this.getCentreCoordinates().x;
			var touchYFromCentre = e.pageY - this.getCentreCoordinates().y;
			var touchAngle = Math.atan2(touchYFromCentre, touchXFromCentre) * (180 / Math.PI);
		
			// Calculate the new rotation angle for the dial
			var rotateAngle = (touchAngle - this.getTouchStartAngle() + this.getTunerStartAngle());

			// Store the rotation deltas for velocity
			this.getLastRotateDeltas().push(this.getCurrentRotation() - rotateAngle);
			if(this.getLastRotateDeltas().length > this.getMaxLastRotateDeltas())
			{
				this.getLastRotateDeltas().shift();
			}
		
			// Rotate the image to the new angle and store the current rotation value so we
			// can calculate the delta on the next touchmove event
			$('.radiotunerdial .dial').css('-webkit-transform','rotate(' + rotateAngle + 'deg)');
			this.setCurrentRotation(rotateAngle);

			this.translateFrequencyListPosition();
		}
	},

	/**
	 * Touch end event handler for the dial control. Calculates swipe velocity if applicable
	 * and sets the selected frequency based on where the dial will end up.
	 * @param {Event} e Touch event.
	 */
	onTouchEnd: function(e) {
		// Determine swipe velocity and target frequency
		if(this.getLastRotateDeltas().length > 0)
		{
			// Set the animating flag to true to prevent user interaction while the transition resolves
			this.setIsTunerAnimating(true);
			
			var velocity = 0;
			var weight = 1;
			for(var i = this.getLastRotateDeltas().length - 1; i >= 0; i--)
			{
				velocity += (this.getLastRotateDeltas()[i] * Math.max(weight, 0));
				weight -= 0.05;
			}
			velocity = velocity / this.getLastRotateDeltas().length;
			
			velocity = (velocity < 0 ? 1 : -1) * Math.pow(velocity, 2) * this.getVelocityMultiplier();
	
			// Cap the maximum velocity to a half list rotation		
			if(Math.abs(velocity) > this.getFullFrequencyListScrollDegrees() / 2)
			{
				velocity = (this.getFullFrequencyListScrollDegrees() / 2) * (velocity < 0 ? -1 : 1);
			}
			
			$('.radiotunerdial .dial').css('-webkit-transition','all ' + Math.abs(velocity * this.getTransitionTimeMultiplier()) + 'ms ease-out');
			$('.radiotunerdial .frequencyListContainer ul').css('-webkit-transition','all ' + Math.abs(velocity * this.getTransitionTimeMultiplier()) + 'ms ease-out');
			
			// Make sure to reset the smoothing transition style once the animation is complete
			setTimeout(this.resetSmoothingTransition, Math.abs(velocity * this.getTransitionTimeMultiplier()));
			
			// Make sure to remove the animating flag once the transition is complete
			setTimeout(function() { this.setIsTunerAnimating(false); }.bind(this), Math.abs(velocity * this.getTransitionTimeMultiplier()));
			
			this.setCurrentRotation(this.getCurrentRotation() + velocity);
			
			// Reset the velocity array
			this.setLastRotateDeltas([]);
		}
		
		
		// Figure out how far off we are from the control snap radian values	
		var angleSnapOffset = this.getCurrentRotation() % this.getTunerCtrlAngleStep();
		
		// Declare the variable that will store the new selected index of the fan control
		var selectedSettingIndex = 0;
		
		// Determine what the new rotation value will be in degrees
		var newRotation = this.getCurrentRotation();
		
		if(angleSnapOffset > 0)
		{
			if(angleSnapOffset <= this.getTunerCtrlAngleStep() / 2)
			{
				// Snap up
				newRotation = newRotation - angleSnapOffset;
			}
			else
			{
				// Snap down
				newRotation = newRotation + (this.getTunerCtrlAngleStep() - angleSnapOffset);
			}
		}
		else
		{
			if(Math.abs(angleSnapOffset) <= this.getTunerCtrlAngleStep() / 2)
			{
				// Snap up
				newRotation = newRotation + Math.abs(angleSnapOffset);
			}
			else
			{
				// Snap down
				newRotation = newRotation - (this.getTunerCtrlAngleStep() - Math.abs(angleSnapOffset));
			}
		}

		// Rotate the dial and update the current rotation value		
		$('.radiotunerdial .dial').css('-webkit-transform','rotate(' + newRotation + 'deg)');
		this.setCurrentRotation(newRotation);
		
		// Update the y transform of the frequency list so that the corresponding frequency
		// is shown
		this.translateFrequencyListPosition();
		
		// Fire an event notifying that the selected station has changed
		this.fireEvent('stationchange', {station: this.calculateSelectedFrequency()});
		this.setSelectedStation(this.calculateSelectedFrequency());

		this.setIsTunerRotating(false);
	},

	/**
	 * Resets the dial and frequency list smoothing webkit-transition properties.
	 */
	resetSmoothingTransition: function() {
		$('.radiotunerdial .dial').css('-webkit-transition','all 50ms linear');
		$('.radiotunerdial .frequencyListContainer ul').css('-webkit-transition','all 50ms linear');
	},

	/**
	 * Updates the y position of the frequency list controls relative to the rotation
	 * of the dial. This function also ensures that the lists 'wrap' once they've gone too far
	 * from what the user can see, so that the list scrolls infinitely.
	 */
	translateFrequencyListPosition: function() {
		// Determine the new Y coordinate for the lists
		var newY = (this.getCurrentRotation()/this.getTunerCtrlAngleStep()) * this.getFrequencyListItemLineHeight();

		// Need to translate each of the frequency ULs separately
		$('.radiotunerdial ul.frequencies').each(function(i, ctrl) {
			var listWrapped = false;
			var transitionStyle = '';

			// Determine if we need to wrap the top most or bottom most lists so that the
			// list remains continuous
			if($(ctrl).data('offsetY') + newY > $(ctrl).height() * 0.5)
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
				$(ctrl).data('offsetY', $(ctrl).data('offsetY') - ($(ctrl).height() * 2));
			}
			else if($(ctrl).data('offsetY') + newY < ($(ctrl).height() * 1.5) * -1)
			{
				listWrapped = true;
				
				transitionStyle = $(ctrl).css('-webkit-transition');
				$(ctrl).css('-webkit-transition', 'none');
				$(this).css('-webkit-transform', 'translate3d(-10000px, ' + $(ctrl).data('offsetY') + 'px, 0px)');

				$(ctrl).data('offsetY', $(ctrl).data('offsetY') + ($(ctrl).height() * 2));
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
	 * Determines which frequency is currently selected based on the rotation of the dial,
	 * taking into account frequency list wrapping.
	 * @return {Number} The selected frequency.
	 */
	calculateSelectedFrequency: function() {
		var selectedFrequency = 0;
		
		if(typeof(this.getTuner()) != 'undefined')
		{
			// Now we need to determine which frequency we've ended up at
			var scrollPosition = this.getCurrentRotation() % this.getFullFrequencyListScrollDegrees();
			
			// If we're rotated clockwise from zero, we need to invert the scroll position as we're
			// decrementing the frequency versus incrementing
			if(scrollPosition > 0)
			{
				scrollPosition = this.getFullFrequencyListScrollDegrees() - scrollPosition;
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