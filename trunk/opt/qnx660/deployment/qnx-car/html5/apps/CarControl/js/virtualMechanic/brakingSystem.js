/**
 * Event handler for brake wear level sensor changes.
 * @param name {String} Sensor name
 * @param value {Number} Sensor value
 */
function onBrakeWearLevelChange(name, value)
{
	if(typeof(value) == 'number' && typeof(name) != 'undefined')
	{
		if(validateBrakeWearLevel(value))
		{
			switch(name)
			{
				case VIRTUAL_MECHANIC.SENSOR_BRAKE_WEAR_RL:
					$('.statusItem.rearLeft.brakeWearLevel').data('status', value);
					break;
				case VIRTUAL_MECHANIC.SENSOR_BRAKE_WEAR_RR:
					$('.statusItem.rearRight.brakeWearLevel').data('status', value);
					break;
				case VIRTUAL_MECHANIC.SENSOR_BRAKE_WEAR_FL:
					$('.statusItem.frontLeft.brakeWearLevel').data('status', value);
					break;
				case VIRTUAL_MECHANIC.SENSOR_BRAKE_WEAR_FR:
					$('.statusItem.frontRight.brakeWearLevel').data('status', value);
					break;
			}
			
			updateSystemStatusBrakingDisplay();
		}
	}
}

/**
 * Validates the supplied value as a valid
 * tire pressure level sensor value.
 * @param value {Number} The value to validate
 * @returns {Boolean} True if valid, False if not
 */
function validateBrakeWearLevel(value)
{
	var isValid = true;
	
	if(typeof(value) == 'undefined' ||
		typeof(value) != 'number' ||
		value < VIRTUAL_MECHANIC.SYSTEM_BRAKE_WEAR_MIN ||
		value > VIRTUAL_MECHANIC.SYSTEM_BRAKE_WEAR_MAX)
	{
		isValid = false;
		console.error('Unrecognized brake wear sensor value: ' + value);			
	}
	
	return isValid;
}

/**
 * Event handler for brake ABS status sensor changes.
 * @param name {String} Sensor name
 * @param value {Boolean} Sensor value
 */
function onBrakeAbsStatusChange(name, value)
{
	if(typeof(value) == 'boolean' && typeof(name) != 'undefined')
	{
		if(validateBrakeAbsStatus(value))
		{
			switch(name)
			{
				case VIRTUAL_MECHANIC.SENSOR_BRAKE_ABS_RL:
					$('.statusItem.rearLeft.brakeAbs').data('status', value);
					break;
				case VIRTUAL_MECHANIC.SENSOR_BRAKE_ABS_RR:
					$('.statusItem.rearRight.brakeAbs').data('status', value);
					break;
				case VIRTUAL_MECHANIC.SENSOR_BRAKE_ABS_FL:
					$('.statusItem.frontLeft.brakeAbs').data('status', value);
					break;
				case VIRTUAL_MECHANIC.SENSOR_BRAKE_ABS_FR:
					$('.statusItem.frontRight.brakeAbs').data('status', value	);
					break;
			}
			
			updateSystemStatusBrakingDisplay();
		}
	}
}

/**
 * Validates the supplied value as a valid
 * brake ABS status sensor value.
 * @param value {Boolean/String} The value to validate
 * @returns {Boolean} True if valid, False if not
 */
function validateBrakeAbsStatus(value)
{
	var isValid = true;
	
  	if(typeof(value) != 'boolean')	
    {
		isValid = false;
		console.error('Unrecognized brake ABS status sensor value: ' + value);			
	}
	
	return isValid;
}

/**
 * Event handler for brake ABS setting sensor changes.
 * @param value {Event} Sensor change event
 */
function onBrakeAbsSettingChange(value)
{
	if(validateBrakeAbsSetting(value))
	{
		var enabled = (typeof(value) == 'boolean' ? value : (value.toLowerCase() == 'true' ? true : false));

		$('#btnAbsToggle').data('enabled', enabled);
		
		updateAbsBrakingToggleSwitchDisplay();
	}
}

/**
 * Turns the ABS Brake setting on or off, persists the value to the API,
 * and then updates the display.
 * @param value {Boolean} True to enabled ABS, False to disable
 */
function setBrakeAbsSetting(value)
{
	if(validateBrakeAbsSetting(value))
	{
		var enabled = (typeof(value) == 'boolean' ? value : (value.toLowerCase() == 'true' ? true : false));
		
		$('#btnAbsToggle').data('enabled', enabled);
		
		// TODO: Persist to API
		
		updateAbsBrakingToggleSwitchDisplay();
	}
}

/**
 * Validates the supplied value as a valid
 * brake ABS setting sensor value.
 * @param value {Boolean/String} The value to validate
 * @returns {Boolean} True if valid, False if not
 */
function validateBrakeAbsSetting(value)
{	
	var isValid = true;
	
	if(typeof(value) == 'undefined' ||
		typeof(value) != 'boolean' || 
		(typeof(value) == 'string' && value.toLowerCase() != 'true' && value.toLowerCase() != 'false'))
	{
		isValid = false;
		console.error('Unrecognized brake ABS setting sensor value: ' + value);			
	}
	
	return isValid;
}

/**
 * Updates the display of all braking system status items
 */
function updateSystemStatusBrakingDisplay()
{
	// Brake wear sensors
	$('.statusItem.brakeWearLevel').each(function() {
		var statusItem = $(this);
		
		// Remove existing statuses
		statusItem.removeClass('caution alert');
		
		if(statusItem.data('status') <= VIRTUAL_MECHANIC.SYSTEM_BRAKE_WEAR_ALERT)
		{
			statusItem.addClass('alert');
		}
		else if(statusItem.data('status') <= VIRTUAL_MECHANIC.SYSTEM_BRAKE_WEAR_CAUTION)
		{
			statusItem.addClass('caution');
		}
	});
	
	// ABS Sensors
	$('.statusItem.brakeAbs').each(function() {
		var statusItem = $(this);
		
		// Remove existing caution status if present
		// Note that since the abs sensor status is either true or false, there
		// is no 'alert' status for the statusItem controls
		statusItem.removeClass('caution');
		
		if(statusItem.data('status') == false)
		{
			statusItem.addClass('caution');
		}
	});
}

/**
 * Updates the display of the ABS Brake toggle control
 */
function updateAbsBrakingToggleSwitchDisplay()
{
	var absToggleBtn = $('#btnAbsToggle');
	if(absToggleBtn.data('enabled'))
	{
		$('.btn', absToggleBtn).removeClass('off').addClass('on');
	}
	else
	{
		$('.btn', absToggleBtn).removeClass('on').addClass('off');
	}
}