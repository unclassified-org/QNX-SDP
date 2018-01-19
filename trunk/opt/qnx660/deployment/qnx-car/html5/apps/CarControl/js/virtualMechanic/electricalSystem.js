/**
 * Event handler for brake tail/head light status sensor changes.
 * @param name {String} Sensor name
 * @param value {Boolean} Sensor value
 */
function onLightStatusChange(name, value)
{
	if(typeof(value) == 'boolean' && typeof(name) != 'undefined')
	{
		if(validateLightStatus(value))
		{
			switch(name)
			{
				case VIRTUAL_MECHANIC.SENSOR_LIGHT_TAIL_RL:
					$('.statusItem.rearLeft.light').data('status', value);
					break;
				case VIRTUAL_MECHANIC.SENSOR_LIGHT_TAIL_RR:
					$('.statusItem.rearRight.light').data('status', value);
					break;
				case VIRTUAL_MECHANIC.SENSOR_LIGHT_HEAD_FL:
					$('.statusItem.frontLeft.light').data('status', value);
					break;
				case VIRTUAL_MECHANIC.SENSOR_LIGHT_HEAD_FR:
					$('.statusItem.frontRight.light').data('status', value);
					break;
			}
			
			updateSystemStatusElectricalDisplay();
		}
	}
}

/**
 * Validates the supplied value as a valid
 * light status sensor value.
 * @param value {Boolean/String} The value to validate
 * @returns {Boolean} True if valid, False if not
 */
function validateLightStatus(value)
{
	var isValid = true;
	
	if(typeof(value) != 'boolean')	
	{
		isValid = false;
		console.error('Unrecognized tail/head light status sensor value: ' + value);			
	}
	
	return isValid;
}


/**
 * Updates the display of all electrical system status items
 */
function updateSystemStatusElectricalDisplay()
{
	// Tail/Head lights
	// TODO: Implementation may cause the 'light' status items to be renamed to be more specific
	$('.statusItem.light').each(function() {
		var statusItem = $(this);
		
		// Remove existing statuses
		statusItem.removeClass('caution alert');
		
		if(statusItem.data('status') == false)
		{
			statusItem.addClass('caution');
			$('.statusText', statusItem).html('Caution')
		}
		else
		{
			$('.statusText', statusItem).html('OK')
		}
	});
}