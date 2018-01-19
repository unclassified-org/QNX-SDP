/**
 * Climate Control fan temperature control event handlers, data persistence, and
 * display update functions.
 *
 * @author lgreenway@lixar.com
 * 
 * $Id: fanTemperature.js 6300 2013-05-17 20:47:39Z mlytvynyuk@qnx.com $
 */

/**
 * The minimum temperature for the temperature controls.
 */
CLIMATE_CONTROL.MIN_TEMP = 15;

/**
 * The maximum temperature for the temperature controls
 */
CLIMATE_CONTROL.MAX_TEMP = 26;

/**
 * The temperature controls will display all degrees between the configured
 * min and max temperatures, incrementing by this value for each step.
 */
CLIMATE_CONTROL.TEMP_INCREMENT = 1;

/**
 * Defines the y coordinate offsets for each degree in the temperature controls.
 * This typically corresponds to the line-height defined in the stylesheet.
 */
CLIMATE_CONTROL.TEMP_LIST_DEGREE_OFFSET = 73 * (screen.height / 480);

/**
 * The maximum number of y coordinate deltas to use for velocity calculation. Decreasing will require a more consistent
 * drag gesture, while increasing will make the calculated velocity less sensitive to drag speed.
 */
CLIMATE_CONTROL.TEMP_LIST_DRAG_SENSITIVITY = 10 * (screen.height / 480);

/**
 * The temperature control's drag gesture acceleration constant. Higher
 * means more dramatic drag momentum.
 */
CLIMATE_CONTROL.TEMP_LIST_ACCEL_CONST = 1;

/**
 * Stores the active dragging temperature control UL element, or controls if the zone link option is set to active.
 */
CLIMATE_CONTROL.draggingTempCtrl = null;

/**
 * Stores the initial y coordinate offset of the temp control UL element at the beginning of a drag operation.
 */
CLIMATE_CONTROL.draggingTempCtrlInitY = 0;

/**
 * The y coordinate offset of where the drag gesture started.
 */
CLIMATE_CONTROL.draggingTempCtrlDragStartY = 0;

/**
 * An array containing the last TEMP_LIST_DRAG_SENSITIVITY y coordinate deltas. Used to calculate drag velocity.
 */
CLIMATE_CONTROL.draggingTempCtrlLastY = [];

/**
 * Stores the temperature control's UL element's -webkit-transition style so it can be re-applied after a drag operation
 * is complete.
 */
CLIMATE_CONTROL.draggingTempCtrlTransitionStyle = '';

/**
 * Temperature control start drag handler. Initializes the drag action data.
 */
function startTempCtrlDrag(e)
{
	// If the zone link option is enabled, then we need to drag all temperature controls
	if($('.zoneLinkToggleControl').data('active') == true)
	{
		CLIMATE_CONTROL.draggingTempCtrl = $('.tempControl ul');
	}
	else
	{
		CLIMATE_CONTROL.draggingTempCtrl = $('ul', this);
	}
	
	CLIMATE_CONTROL.draggingTempCtrlInitY = $('ul', this).position().top - parseInt($('ul', this).css('top'));
	CLIMATE_CONTROL.draggingTempCtrlLastY = [CLIMATE_CONTROL.draggingTempCtrlInitY]; 
	CLIMATE_CONTROL.draggingTempCtrlDragStartY = e.pageY;

	// Get rid of the webkit transition style temporarily to halt any animations while we drag
	// and also halt any y coordinate translations in progress while doing so
	CLIMATE_CONTROL.draggingTempCtrlTransitionStyle = CLIMATE_CONTROL.draggingTempCtrl.css('-webkit-transition');
	CLIMATE_CONTROL.draggingTempCtrl.css('-webkit-transition', 'none');
	CLIMATE_CONTROL.draggingTempCtrl.css('-webkit-transform', 'translate3d(0px, ' + ((e.pageY - CLIMATE_CONTROL.draggingTempCtrlDragStartY) + CLIMATE_CONTROL.draggingTempCtrlInitY) + 'px, 0px)');

	return false;
}

/**
 * Temperature control end drag handler. Snaps the temperature control to the closest temperature
 * value, and then cleans up.
 */
function finishTempCtrlDrag(e)
{
	if(CLIMATE_CONTROL.draggingTempCtrl)
	{
		var velocity = getTempCtrlDragVelocity();

		if(velocity != 0)
		{
			// Restore the transition style for the element
			CLIMATE_CONTROL.draggingTempCtrl.css('-webkit-transition', CLIMATE_CONTROL.draggingTempCtrlTransitionStyle);
			
			// Determine the resulting change in the y coordinate based on the velocity
			var velocityYChange = Math.pow(velocity,2) * CLIMATE_CONTROL.TEMP_LIST_ACCEL_CONST;

			// Make sure the change is negative if the velocity is negative since we squared the velocity above
			if(velocity < 0)
			{
				velocityYChange = velocityYChange * -1;
			}
			
			// Calculate the new y coordinate for the list
			var newY = (e.pageY - CLIMATE_CONTROL.draggingTempCtrlDragStartY) + CLIMATE_CONTROL.draggingTempCtrlInitY + velocityYChange;
			
			if(newY > 0)
			{
				// Snap to min degree
				newY = 0;
			}
			else if(newY < -1 * (CLIMATE_CONTROL.MAX_TEMP - CLIMATE_CONTROL.MIN_TEMP) * (1 / CLIMATE_CONTROL.TEMP_INCREMENT) * CLIMATE_CONTROL.TEMP_LIST_DEGREE_OFFSET)
			{
				// Snap to max degree
				newY = -1 * ((CLIMATE_CONTROL.MAX_TEMP - CLIMATE_CONTROL.MIN_TEMP) * (1 / CLIMATE_CONTROL.TEMP_INCREMENT)) * CLIMATE_CONTROL.TEMP_LIST_DEGREE_OFFSET;
			}
			else
			{
				// Snap to closest degree
				newY  = Math.round(newY / CLIMATE_CONTROL.TEMP_LIST_DEGREE_OFFSET) * CLIMATE_CONTROL.TEMP_LIST_DEGREE_OFFSET;
			}

			// Determine the new temperature value for the control
			setTemperature(CLIMATE_CONTROL.draggingTempCtrl.parents('.tempControl').attr('data-zone'), 
							(Math.round(Math.abs(newY) / CLIMATE_CONTROL.TEMP_LIST_DEGREE_OFFSET) * CLIMATE_CONTROL.TEMP_INCREMENT) + CLIMATE_CONTROL.MIN_TEMP);
		}
		else
		{
			// If there's no velocity, then we can assume that no change should occur, and just snap back to the current temperature value
		
			// Update the temperature control display
			updateTempControlDisplay();
		}
		
		// Clean up
		CLIMATE_CONTROL.draggingTempCtrl = null;
		CLIMATE_CONTROL.draggingTempCtrlInitY = null; 
		CLIMATE_CONTROL.draggingTempCtrlLastY = [];
		CLIMATE_CONTROL.draggingTempCtrlDragStartY = null;
	}
}

/**
 * Returns the calculated velocity of the temperature control drag action.
 * @return {Number} Calculated velocity, can be negative, positive, or zero.
 */
function getTempCtrlDragVelocity()
{
	// Calculate the velocity of the drag based on the average of the last y deltas
	var velocity = 0;
	for(var i=1; i < CLIMATE_CONTROL.draggingTempCtrlLastY.length; i++)
	{
		velocity += (CLIMATE_CONTROL.draggingTempCtrlLastY[i] - CLIMATE_CONTROL.draggingTempCtrlLastY[i-1]);
	}
	return velocity / CLIMATE_CONTROL.draggingTempCtrlLastY.length;
}

function tempCtrlDrag(e)
{
	if(CLIMATE_CONTROL.draggingTempCtrl)
	{
		CLIMATE_CONTROL.draggingTempCtrl.css('-webkit-transform', 'translate3d(0px, ' + ((e.pageY - CLIMATE_CONTROL.draggingTempCtrlDragStartY) + CLIMATE_CONTROL.draggingTempCtrlInitY) + 'px, 0px)');
		
		//  Store the last few y deltas so we can calculate velocity
		if(CLIMATE_CONTROL.draggingTempCtrlLastY.length > CLIMATE_CONTROL.TEMP_LIST_DRAG_SENSITIVITY)
		{
			CLIMATE_CONTROL.draggingTempCtrlLastY.shift();
		}
		
		CLIMATE_CONTROL.draggingTempCtrlLastY.push((e.pageY - CLIMATE_CONTROL.draggingTempCtrlDragStartY) + CLIMATE_CONTROL.draggingTempCtrlInitY);
	}
}

function onFanTemperatureChange(e)
{
	if(typeof(e) != 'undefined' && typeof(e.zone) != 'undefined'  && typeof(e.value) != 'undefined')
	{
		var zoneLinkActive = $('.zoneLinkToggleControl').data('active');

		if(validateFanTemperature(e.value))
		{
			$('.tempControl[data-zone=' + e.zone + ']').data('temp', e.value);
		}

		updateTempControlDisplay();
	}
	else
	{
		console.warning('Fan temperature change event for unknown zone: ' + e);
	}
}


/**
 * Validates the supplied value as a valid
 * fan temperature value.
 * @param value {Number} The value to validate
 * @returns {Boolean} True if valid, False if not
 */
function validateFanTemperature(value)
{
	var isValid = true;
	
	if(typeof(value) != 'number' ||
		value < CLIMATE_CONTROL.MIN_TEMP ||
		value > CLIMATE_CONTROL.MAX_TEMP)
	{
		isValid = false;
		console.error('Unrecognized fan temperature HVAC value: ' + value);			
	}
	
	return isValid;
}

/**
 * Sets the temperature setting for a particular zone
 * @param zone {String} The zone to which the fan setting will be applied (this
 * 	relates to the data-zone attribute of the temperature control).
 * @param temp {Number} The temperature value
 */
function setTemperature(zone, temp)
{
	if(validateFanTemperature(temp))
	{
		if(typeof(zone) != 'undefined' && zone != ''
			&& !$('.zoneLinkToggleControl').data('active'))
		{
			// Persist to API
			try
			{
				car.hvac.set(car.hvac.HvacSetting.TEMPERATURE, zone, temp);
			}
			catch(ex)
			{
				console.error('Unable to persist fan temperature change to API', ex);
			}
		}
		else
		{	
			try
			{
				// Both fan speeds get updated since the zones are linked
				car.hvac.set(car.hvac.HvacSetting.TEMPERATURE, car.Zone.ROW1_LEFT, temp);
				car.hvac.set(car.hvac.HvacSetting.TEMPERATURE, car.Zone.ROW1_RIGHT, temp);
			}
			catch(ex)
			{
				console.error('Unable to persist fan temperature change to API', ex);
			}
		}
		
	}
}

/**
 * Updates the display of all temperature controls
 */
function updateTempControlDisplay()
{
	$('.tempControl').each(function() {
		var temp = $(this).data('temp');
		$('ul', this).css('-webkit-transform', 'translate3d(0px, ' + (temp - CLIMATE_CONTROL.MIN_TEMP) * (1 / CLIMATE_CONTROL.TEMP_INCREMENT) * CLIMATE_CONTROL.TEMP_LIST_DEGREE_OFFSET * -1 + 'px, 0px)');
	});
}