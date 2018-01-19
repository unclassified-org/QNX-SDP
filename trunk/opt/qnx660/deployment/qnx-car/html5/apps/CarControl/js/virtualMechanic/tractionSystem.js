/**
 * Event handler for tire pressure sensor changes.
 * @param value {Event} Sensor change event
 * @param name {String} Sensor name
 */
function onTirePressureLevelChange(name, value)
{
	if(typeof(value) != 'undefined' && typeof(name) != 'undefined')
	{
		if(validateTirePressureLevel(value))
		{
			switch(name)
			{
				case VIRTUAL_MECHANIC.SENSOR_TIRE_PRESSURE_RL:
					$('.statusItem.rearLeft.tirePressure').data('status', value);
					break;
				case VIRTUAL_MECHANIC.SENSOR_TIRE_PRESSURE_RR:
					$('.statusItem.rearRight.tirePressure').data('status', value);
					break;
				case VIRTUAL_MECHANIC.SENSOR_TIRE_PRESSURE_FL:
					$('.statusItem.frontLeft.tirePressure').data('status', value);
					break;
				case VIRTUAL_MECHANIC.SENSOR_TIRE_PRESSURE_FR:
					$('.statusItem.frontRight.tirePressure').data('status', value);
					break;
			}
			
			updateSystemStatusTractionDisplay();
		}
	}
}

/**
 * Validates the supplied value as a valid
 * tire pressure level sensor value.
 * @param value {Number} The value to validate
 * @returns {Boolean} True if valid, False if not
 */
function validateTirePressureLevel(value)
{
	var isValid = true;
	
	if(typeof(value) == 'undefined' ||
		typeof(value) != 'number' ||
		value < VIRTUAL_MECHANIC.SYSTEM_TIRE_PRESSURE_MIN)
	{
		isValid = false;
		console.error('Unrecognized tire pressure sensor value: ' + value);			
	}
	
	return isValid;
}

/**
 * Event handler for tire wear sensor changes.
 * @param value {Event} Sensor change event
 */
function onTireWearLevelChange(name, value)
{
	if(typeof(value) != 'undefined' && typeof(name) != 'undefined')
	{
		if(validateTireWearLevel(value))
		{
			switch(name)
			{
				case VIRTUAL_MECHANIC.SENSOR_TIRE_WEAR_RL:
					$('.statusItem.rearLeft.tireWearLevel').data('status', value);
					break;
				case VIRTUAL_MECHANIC.SENSOR_TIRE_WEAR_RR:
					$('.statusItem.rearRight.tireWearLevel').data('status', value);
					break;
				case VIRTUAL_MECHANIC.SENSOR_TIRE_WEAR_FL:
					$('.statusItem.frontLeft.tireWearLevel').data('status', value);
					break;
				case VIRTUAL_MECHANIC.SENSOR_TIRE_WEAR_FR:
					$('.statusItem.frontRight.tireWearLevel').data('status', value);
					break;
			}
			
			updateSystemStatusTractionDisplay();
		}
	}
}

/**
 * Validates the supplied value as a valid
 * tire wear level sensor value.
 * @param value {Number} The value to validate
 * @returns {Boolean} True if valid, False if not
 */
function validateTireWearLevel(value)
{
	var isValid = true;
	
	if(typeof(value) == 'undefined' ||
		typeof(value) != 'number' ||
		value < VIRTUAL_MECHANIC.SYSTEM_TIRE_WEAR_MIN ||
		value > VIRTUAL_MECHANIC.SYSTEM_TIRE_WEAR_MAX)
	{
		isValid = false;
		console.error('Unrecognized tire wear sensor value: ' + value);			
	}
	
	return isValid;
}

/**
 * Updates the display of all traction system status items
 */
function updateSystemStatusTractionDisplay()
{
	// Tire Pressure
	$('.statusItem.tirePressure').each(function() {
		var statusItem = $(this);
		
		// Remove existing statuses
		statusItem.removeClass('caution alert');
		
		if(statusItem.data('status') <= VIRTUAL_MECHANIC.SYSTEM_TIRE_PRESSURE_ALERT_LOW ||
			statusItem.data('status') >= VIRTUAL_MECHANIC.SYSTEM_TIRE_PRESSURE_ALERT_HIGH)
		{
			statusItem.addClass('alert');
		}
		else if(statusItem.data('status') <= VIRTUAL_MECHANIC.SYSTEM_TIRE_PRESSURE_CAUTION_LOW ||
			statusItem.data('status') >= VIRTUAL_MECHANIC.SYSTEM_TIRE_PRESSURE_CAUTION_HIGH)
		{
			statusItem.addClass('caution');
		}
	});
	
	
	// Wear Level
	$('.statusItem.tireWearLevel').each(function() {
		var statusItem = $(this);
		
		// Remove existing statuses
		statusItem.removeClass('caution alert');
		
		if(statusItem.data('status') <= VIRTUAL_MECHANIC.SYSTEM_TIRE_WEAR_ALERT)
		{
			statusItem.addClass('alert');
		}
		else if(statusItem.data('status') <= VIRTUAL_MECHANIC.SYSTEM_TIRE_WEAR_CAUTION)
		{
			statusItem.addClass('caution');
		}
	});
}