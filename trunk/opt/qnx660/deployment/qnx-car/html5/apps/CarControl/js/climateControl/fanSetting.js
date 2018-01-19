/**
 * Climate Control fan setting control event handlers, data persistence, and
 * display update functions.
 *
 * @author lgreenway@lixar.com
 * 
 * $Id: fanSetting.js 6600 2013-06-18 17:36:58Z mlapierre@qnx.com $
 */

/**
 * Fan setting for windshield and head
 */
CLIMATE_CONTROL.FAN_SETTING_WINDSHIELD_FEET = 'defrostAndFeet';

/**
 * Fan setting for windshield
 */
CLIMATE_CONTROL.FAN_SETTING_WINDSHIELD = 'defrost';

/**
 * Fan setting for head
 */
CLIMATE_CONTROL.FAN_SETTING_HEAD = 'face';

/**
 * Fan setting for head and feet
 */
CLIMATE_CONTROL.FAN_SETTING_HEAD_FEET = 'faceAndFeet';

/**
 * Fan setting for feet
 */
CLIMATE_CONTROL.FAN_SETTING_FEET = 'feet';

/**
 * This is array to adapt string value to the indexes
 * */
CLIMATE_CONTROL.FAN_SETTINGS = [
								CLIMATE_CONTROL.FAN_SETTING_WINDSHIELD_FEET,
								CLIMATE_CONTROL.FAN_SETTING_WINDSHIELD,
								CLIMATE_CONTROL.FAN_SETTING_HEAD,
								CLIMATE_CONTROL.FAN_SETTING_HEAD_FEET,
								CLIMATE_CONTROL.FAN_SETTING_FEET
							   ];

/**
 * The number of steps in the fan control dial.
 * This corresponds to the number of settings for the dial.
 */ 
CLIMATE_CONTROL.FAN_CTRL_STEPS = 5;

/**
 * The number of degrees per fan control step. Pre-calculated for performance.
 */
CLIMATE_CONTROL.FAN_CTRL_ANGLE_STEP = 360 / 5;

/**
 * Object cache for the currently rotating fan setting control
 */
CLIMATE_CONTROL.rotatingFanControl = false;

/**
 * Event handler for fan setting HVAC changes.
 * @param e {Event} HVAC change event
 */
function onFanSettingChange(e)
{
	if(typeof(e) != 'undefined' && typeof(e.zone) != 'undefined'  && typeof(e.value) != 'undefined')
	{
		var zoneLinkActive = $('.zoneLinkToggleControl').data('active');

		if(validateFanSetting(e.value))
		{
			$('.fanControl[data-zone=' + e.zone + ']').data('setting', e.value);
		}

		updateFanControlDisplay();
	}
	else
	{
		console.warning('Fan speed change event for unknown zone: ' + e);
	}
}

/**
 * Validates the supplied value as a valid
 * fan setting value.
 * @param value {Number} The value to validate
 * @returns {Boolean} True if valid, False if not
 */
function validateFanSetting(value)
{
	var isValid = true;

	if( value != CLIMATE_CONTROL.FAN_SETTING_WINDSHIELD_FEET &&
			value != CLIMATE_CONTROL.FAN_SETTING_WINDSHIELD &&
			value != CLIMATE_CONTROL.FAN_SETTING_HEAD &&
			value != CLIMATE_CONTROL.FAN_SETTING_HEAD_FEET &&
			value != CLIMATE_CONTROL.FAN_SETTING_FEET	)
	{
		isValid = false;
		console.error('Unrecognized fan setting HVAC value: ' + value);			
	}
	
	return isValid;
}

/**
 * Called when vmousedown event is fired from the fan control. Initializes
 * data required to rotate the control.
 * @param e {Event} The vmousedown event
 * @returns {Boolean} False
 */
function startFanControlRotate(e)
{
	// Store the fan control dials that we're going to rotate
	CLIMATE_CONTROL.rotatingFanControl = $('.dial, .dialActive', this);
	
	// Add a dragging class to all fan controls so that the default transition isn't applied
	$('.fanControl').addClass('dragging');
	
	// Store the angle of the mouse at the start of the rotation, relative to the image centre
	// If the centreCoordinates data is not present, we'll init it - this should only happen
	// once for performance reasons.
	if($(CLIMATE_CONTROL.rotatingFanControl).data('centreCoordinates') == undefined)
	{
		$(CLIMATE_CONTROL.rotatingFanControl).data('centreCoordinates', getControlCentre($(CLIMATE_CONTROL.rotatingFanControl).parents('.fanControl')));
	}
	
	var imageCentre = $(CLIMATE_CONTROL.rotatingFanControl).data('centreCoordinates');
	var mouseStartXFromCentre = e.pageX - imageCentre[0];
	var mouseStartYFromCentre = e.pageY - imageCentre[1];
	mouseStartAngle = Math.atan2( mouseStartYFromCentre, mouseStartXFromCentre );

	// Store the current rotation angle of the image at the start of the rotation
	imageStartAngle = $(CLIMATE_CONTROL.rotatingFanControl).data('currentRotation');

	return false;
}

/**
 * Called when vmouseup event is fired from the fan control. Determines
 * which setting the control is closest to, and then calls the setFanSetting
 * function to complete the interaction.
 * @param e {Event} The vmouseup event
 * @returns {Boolean} False
 */
function stopFanControlRotate(e) {
	// Remove the dragging class
	$('.fanControl').removeClass('dragging');

	// Get the control's current rotation for simpicity's sake
	var currentRotation = $(CLIMATE_CONTROL.rotatingFanControl).data('currentRotation');

	// Get the name of the zone the user is interacting with
	var zone = $(CLIMATE_CONTROL.rotatingFanControl).parent('.fanControl').attr('data-zone');

	var isClockwiseIndex = $(CLIMATE_CONTROL.rotatingFanControl).parent('.fanControl').attr('data-clockwise-index');

	// Figure out how far off we are from the control snap radian values	
	var angleSnapOffset = currentRotation % degToRad(CLIMATE_CONTROL.FAN_CTRL_ANGLE_STEP);
	
	// Declare the variable that will store the new selected index of the fan control
	var selectedSettingIndex = 0;
	
	// Now we need to determine which 'setting' the snapped value corresponds to and persist that to the API
	if(angleSnapOffset > 0)
	{
		if(angleSnapOffset <= degToRad(CLIMATE_CONTROL.FAN_CTRL_ANGLE_STEP) / 2)
		{
			// Snap up
			selectedSettingIndex = radToDeg(currentRotation - angleSnapOffset) / CLIMATE_CONTROL.FAN_CTRL_ANGLE_STEP;
		}
		else
		{
			selectedSettingIndex = radToDeg(currentRotation + (degToRad(CLIMATE_CONTROL.FAN_CTRL_ANGLE_STEP) - angleSnapOffset)) / CLIMATE_CONTROL.FAN_CTRL_ANGLE_STEP;
		}
	}
	else
	{
		if(Math.abs(angleSnapOffset) <= degToRad(CLIMATE_CONTROL.FAN_CTRL_ANGLE_STEP) / 2)
		{
			// Snap up
			selectedSettingIndex = radToDeg(currentRotation + Math.abs(angleSnapOffset)) / CLIMATE_CONTROL.FAN_CTRL_ANGLE_STEP;
		}
		else
		{
			selectedSettingIndex = radToDeg(currentRotation - (degToRad(CLIMATE_CONTROL.FAN_CTRL_ANGLE_STEP) - Math.abs(angleSnapOffset))) / CLIMATE_CONTROL.FAN_CTRL_ANGLE_STEP;
		}
	}
	
	// The index of the fan setting is inverted if the control spins in the opposite direction
	if(isClockwiseIndex)
	{
		selectedSettingIndex = Math.abs(selectedSettingIndex - CLIMATE_CONTROL.FAN_CTRL_STEPS);
	}
	
	// Wrap the index
	if(selectedSettingIndex >= CLIMATE_CONTROL.FAN_CTRL_STEPS)
	{
		selectedSettingIndex = 0;
	}
	
	setFanSetting(zone, CLIMATE_CONTROL.FAN_SETTINGS[selectedSettingIndex]);

	CLIMATE_CONTROL.rotatingFanControl = false;
}

/**
 * Function handler for the fan control vmousemove event. This function is called
 * regardless of whether the startFanControlRotate function has been called, but
 * won't do anything unless a value is defined for CLIMATE_CONTROL.rotatingFanControl.
 * @param e {Event} The vmousemove event
 * @returns {Boolean} False
 */
function rotateFanControl(e) {
	// If no CLIMATE_CONTROL.rotatingFanControl value is set, simply return and don't do anything
	if(typeof(CLIMATE_CONTROL.rotatingFanControl) == 'undefined' || !CLIMATE_CONTROL.rotatingFanControl)
	{
		return false;
	}

	// Get the image centre coordinates
	if($(CLIMATE_CONTROL.rotatingFanControl).data('centreCoordinates') == undefined)
	{
		$(CLIMATE_CONTROL.rotatingFanControl).data('centreCoordinates', getControlCentre($(CLIMATE_CONTROL.rotatingFanControl).parents('.fanControl')));
	}

	var imageCentre = $(CLIMATE_CONTROL.rotatingFanControl).data('centreCoordinates');
	var mouseXFromCentre = e.pageX - imageCentre[0];
	var mouseYFromCentre = e.pageY - imageCentre[1];
	var mouseAngle = Math.atan2( mouseYFromCentre, mouseXFromCentre );

	// Calculate the new rotation angle for the dials
	var rotateAngle = mouseAngle - mouseStartAngle + imageStartAngle;
	
	// Ensure we're only ever working within the positive range of radians for a single revolution (2*PI)
	if(rotateAngle > 2*Math.PI)
	{
		rotateAngle = rotateAngle - (2*Math.PI);
	}
	else if(rotateAngle < 0)
	{
		rotateAngle = (2*Math.PI) + rotateAngle;
	}

	// Rotate the image to the new angle, and store the new angle as data for the dials
	$(CLIMATE_CONTROL.rotatingFanControl).css('-webkit-transform','rotate(' + rotateAngle + 'rad)');
	$(CLIMATE_CONTROL.rotatingFanControl).data('currentRotation', rotateAngle );

	// If zone link is enabled, we need to rotate the other fan control dial along with the one we're rotating
	if($('.zoneLinkToggleControl').data('active') == true)
	{
		var currentZone = $(CLIMATE_CONTROL.rotatingFanControl).parent('.fanControl').attr('data-zone');
		var inverseRotateAngle = (2*Math.PI) - rotateAngle;
		
		if(currentZone == car.Zone.ROW1_LEFT)
		{
			var rightFanCtrl = $('.dial, .dialActive', '.fanControl[data-zone=' + car.Zone.ROW1_RIGHT + ']');
			rightFanCtrl.css('-webkit-transform','rotate(' + inverseRotateAngle + 'rad)');
			rightFanCtrl.data('currentRotation', inverseRotateAngle);
		}
		else
		{
			var leftFanCtrl = $('.dial, .dialActive', '.fanControl[data-zone=' + car.Zone.ROW1_LEFT + ']');
			leftFanCtrl.css('-webkit-transform','rotate(' + inverseRotateAngle + 'rad)');
			leftFanCtrl.data('currentRotation', inverseRotateAngle);
		}
	}

	
	return false;
}

/**
 * Tap handler for the fan control dials. This function determine where the user
 * has tapped the control and will either change the setting next or previous, depending
 * on whether the tap gesture was on the upper third, or lower third of the control.
 * @param e {Event} The tap event
 * @returns {Boolean} False
 */
function onFanControlTap(e)
{
	var controlHeight = $(this).height();
	
	var currSetting = $(this).data('setting');
	var newSetting = currSetting;
	
	if(e.pageY - $(this).position().top < $(this).height() / 3)
	{
		if(currSetting == CLIMATE_CONTROL.FAN_SETTINGS[CLIMATE_CONTROL.FAN_SETTINGS.length - 1])
		{
			newSetting = CLIMATE_CONTROL.FAN_SETTINGS[0];
		}
		else
		{
			var currIndex = CLIMATE_CONTROL.FAN_SETTINGS.indexOf(currSetting);
			newSetting = CLIMATE_CONTROL.FAN_SETTINGS[currIndex + 1];
		}
	}
	else if(e.pageY - $(this).position().top > $(this).height() - $(this).height() / 3)
	{
		if(currSetting == CLIMATE_CONTROL.FAN_SETTINGS[0])
		{
			newSetting = CLIMATE_CONTROL.FAN_SETTINGS[CLIMATE_CONTROL.FAN_SETTINGS.length - 1];
		}
		else
		{
			var currIndex = CLIMATE_CONTROL.FAN_SETTINGS.indexOf(currSetting);
			newSetting = CLIMATE_CONTROL.FAN_SETTINGS[currIndex - 1];
		}
	}
	
	if(newSetting != currSetting)
	{
		setFanSetting($(this).attr('data-zone'), newSetting);
	}
	
	return false;
}

/**
 * Sets the fan setting for a particular zone
 * @param zone {String} The zone to which the fan setting will be applied (this
 * 	relates to the data-zone attribute of the fan control).
 * @param setting {String} The fan setting (based on constant?)
 */
function setFanSetting(zone, setting)
{
	if(validateFanSetting(setting))
	{
		if(typeof(zone) != 'undefined' && zone != ''
			&& !$('.zoneLinkToggleControl').data('active'))
		{
			// Targeting a specific zone
			$('.fanControl[data-zone=' + zone + ']').data('setting', setting);
			
			try
			{
				// Both fan speeds get updated since the zones are linked
				car.hvac.set(car.hvac.HvacSetting.FAN_DIRECTION, zone, setting);
			}
			catch(ex)
			{
				console.error('Unable to persist fan setting change to API', ex);
			}
		}
		else
		{
			try
			{
				// Both fan speeds get updated since the zones are linked
				car.hvac.set(car.hvac.HvacSetting.FAN_DIRECTION, car.Zone.ROW1_LEFT, setting);
				car.hvac.set(car.hvac.HvacSetting.FAN_DIRECTION, car.Zone.ROW1_RIGHT, setting);
			}
			catch(ex)
			{
				console.error('Unable to persist fan setting change to API', ex);
			}
		}
		
	}
}

/**
 * Updates the UI to reflect the fan control settings
 */
function updateFanControlDisplay()
{
	// Iterate through each fan control and update their display
	$('.fanControl').each(function() {
		var setting = $(this).data('setting');

		if(typeof(setting) != 'undefined')
		{

			// get the index of the entry
			setting = CLIMATE_CONTROL.FAN_SETTINGS.indexOf(setting);

			var currentRotation = $('.dial, .dialActive', this).data('currentRotation');
			var rotateTo = 0;
			
			// Calculate the target rotation based on the setting value
			if($(this).attr('data-clockwise-index') == "true")
			{
				rotateTo = (setting*-1) * degToRad(CLIMATE_CONTROL.FAN_CTRL_ANGLE_STEP);
			}
			else
			{
				rotateTo = setting * degToRad(CLIMATE_CONTROL.FAN_CTRL_ANGLE_STEP);
			}
	
			// Ensure we're working only within positive radian values of a single revolution		
			if(rotateTo >= (2*Math.PI))
			{
				rotateTo = 0;
			}
			
			if(rotateTo < 0)
			{
				rotateTo = (2*Math.PI) + rotateTo;
			}
			
			// Regardless of what the rotateTo value is, we need to determine the shortest
			// route to the target and use that rotational offset
			var dialControls = $('.dial, .dialActive', this);
			var currentTransformRotation = parseFloat(dialControls.first().rotate());
			
			if(rotateTo >= currentRotation)
			{
				if(Math.abs(rotateTo - currentRotation) <= Math.abs((2*Math.PI) - rotateTo + currentRotation))
				{
					dialControls.css('-webkit-transform', 'rotate(' + (currentTransformRotation + (rotateTo - currentRotation)) + 'rad)')
				}
				else
				{
					dialControls.css('-webkit-transform', 'rotate(' + (currentTransformRotation - Math.abs((2*Math.PI) - rotateTo + currentRotation)) + 'rad)')
				}
			}		
			else
			{
				if(currentRotation - rotateTo <= Math.abs((2*Math.PI) - currentRotation + rotateTo))
				{
					dialControls.css('-webkit-transform', 'rotate(' + (currentTransformRotation - (currentRotation - rotateTo)) + 'rad)')
				}
				else
				{
					dialControls.css('-webkit-transform', 'rotate(' + (currentTransformRotation  + Math.abs((2*Math.PI) - currentRotation + rotateTo)) + 'rad)')
				}
			}
	
			// The rotateTo value holds the correct value of the dial's current rotation, so keep that
			$('.dial, .dialActive', this).data('currentRotation', rotateTo);
		}
	});
}