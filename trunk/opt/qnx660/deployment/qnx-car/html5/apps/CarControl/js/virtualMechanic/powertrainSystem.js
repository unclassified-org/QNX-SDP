/**
 * Event handler for engine oil pressure sensor changes.
 * @param value {Event} Sensor change event
 */
function onEngineOilPressureLevelChange(value)
{
	if(typeof(value) != 'undefined')
	{
		if(validateEngineOilPressureLevel(value))
		{
			$('.statusItem.engineOil.pressure').data('status', value);
	
			updateSystemStatusPowertrainDisplay();
		}
	}
}

/**
 * Validates the supplied value as a valid
 * engine oil pressure sensor value.
 * @param value {Number} The value to validate
 * @returns {Boolean} True if valid, False if not
 */
function validateEngineOilPressureLevel(value)
{
	var isValid = true;
	
	if(typeof(value) != 'number' || 
		value < VIRTUAL_MECHANIC.SYSTEM_ENGINE_OIL_PRESSURE_MIN ||
		value > VIRTUAL_MECHANIC.SYSTEM_ENGINE_OIL_PRESSURE_MAX)
	{
		isValid = false;
		console.error('Unrecognized engine oil pressure sensor value: ' + value);			
	}
	
	return isValid;
}

/**
 * Event handler for engine oil level sensor changes.
 * @param value {Event} Sensor change event
 */
function onEngineOilLevelChange(value)
{
	if(typeof(value) != 'undefined')
	{
		if(validateEngineOilLevel(value))
		{
			$('.statusItem.engineOil.level').data('status', value);
	
			updateSystemStatusPowertrainDisplay();
		}
	}
}

/**
 * Validates the supplied value as a valid
 * engine oil level sensor value.
 * @param value {Number} The value to validate
 * @returns {Boolean} True if valid, False if not
 */
function validateEngineOilLevel(value)
{
	var isValid = true;
	
	if(typeof(value) != 'number' || 
		value < VIRTUAL_MECHANIC.SYSTEM_ENGINE_OIL_LEVEL_MIN ||
		value > VIRTUAL_MECHANIC.SYSTEM_ENGINE_OIL_LEVEL_MAX)
	{
		isValid = false;
		console.error('Unrecognized engine oil level sensor value: ' + value);			
	}
	
	return isValid;
}

/**
 * Event handler for engine RPM sensor changes.
 * @param value {Event} Sensor change event
 */
function onEngineRpmChange(value)
{
	if(typeof(value) != 'undefined')
	{
		if(validateEngineRpm(value))
		{
			$('.statusItem.engine.rpm').data('status', value);
	
			updateSystemStatusPowertrainDisplay();
		}
	}
}

/**
 * Validates the supplied value as a valid
 * engine RPM sensor value.
 * @param value {Number} The value to validate
 * @returns {Boolean} True if valid, False if not
 */
function validateEngineRpm(value)
{
	var isValid = true;
	
	if(typeof(value) != 'number' || 
		value < VIRTUAL_MECHANIC.SYSTEM_ENGINE_RPM_MIN)
	{
		isValid = false;
		console.error('Unrecognized engine RPM sensor value: ' + value);			
	}
	
	return isValid;
}

/**
 * Event handler for transmission temperature sensor changes.
 * @param value {Event} Sensor change event
 */
function onTransmissionTemperatureChange(value)
{
	if(typeof(value) != 'undefined')
	{
		if(validateTransmissionTemperature(value))
		{
			$('.statusItem.transmission.temperature').data('status', value);
	
			updateSystemStatusPowertrainDisplay();
		}
	}
}

/**
 * Validates the supplied value as a valid
 * transmission temperature sensor value.
 * @param value {Number} The value to validate
 * @returns {Boolean} True if valid, False if not
 */
function validateTransmissionTemperature(value)
{
	var isValid = true;
	
	if(typeof(value) != 'number' || 
		value < VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_TEMPERATURE_MIN ||
		value > VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_TEMPERATURE_MAX)
	{
		isValid = false;
		console.error('Unrecognized transmission temperature sensor value: ' + value);			
	}
	
	return isValid;
}

/**
 * Event handler for transmission clutch wear sensor changes.
 * @param value {Event} Sensor change event
 */
function onTransmissionClutchWearChange(value)
{
	if(typeof(value) != 'undefined')
	{
		if(validateTransmissionClutchWear(value))
		{
			$('.statusItem.transmission.clutchWear').data('status', value);
	
			updateSystemStatusPowertrainDisplay();
		}
	}
}

/**
 * Validates the supplied value as a valid
 * transmission clutch wear sensor value.
 * @param value {Number} The value to validate
 * @returns {Boolean} True if valid, False if not
 */
function validateTransmissionClutchWear(value)
{
	var isValid = true;
	
	if(typeof(value) != 'number' || 
		value < VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_CLUTCH_WEAR_MIN ||
		value > VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_CLUTCH_WEAR_MAX)
	{
		isValid = false;
		console.error('Unrecognized transmission clutch wear sensor value: ' + value);			
	}
	
	return isValid;
}

/**
 * Event handler for transmission clutch wear sensor changes.
 * @param value {Event} Sensor change event
 */
function onTransmissionGearChange(value)
{
	if(typeof(value) != 'undefined')
	{
		if(validateTransmissionGear(value))
		{
			$('.currentGear').data('status', value);
	
			updateSystemStatusPowertrainDisplay();
		}
	}
}

/**
 * Validates the supplied value as a valid
 * transmission clutch wear sensor value.
 * @param value {String} The value to validate
 * @returns {Boolean} True if valid, False if not
 */
function validateTransmissionGear(value)
{
	var isValid = true;
	
	if(value != VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_GEAR_PARK &&
		value != VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_GEAR_NEUTRAL &&
		value != VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_GEAR_REVERSE &&
		value != VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_GEAR_DRIVE &&
		value != VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_GEAR_1 &&
		value != VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_GEAR_2 &&
		value != VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_GEAR_3 &&
		value != VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_GEAR_4 &&
		value != VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_GEAR_5 &&
		value != VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_GEAR_6 &&
		value != VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_GEAR_7)
	{
		isValid = false;
		console.error('Unrecognized transmission gear sensor value: ' + value);			
	}
	
	return isValid;
}

/**
 * Updates the display of the powertrain dialog statuses
 */
function updateSystemStatusPowertrainDisplay()
{
	// Engine Oil
	// Pressure
	var engOilPressure = $('.statusItem.engineOil.pressure');
	engOilPressure.removeClass('caution alert');
	if(engOilPressure.data('status') <= VIRTUAL_MECHANIC.SYSTEM_ENGINE_OIL_PRESSURE_ALERT_THRESHOLD)
	{
		engOilPressure.addClass('alert');
		$('.statusText', engOilPressure).html('Alert');
	}
	else if(engOilPressure.data('status') <= VIRTUAL_MECHANIC.SYSTEM_ENGINE_OIL_PRESSURE_CAUTION_THRESHOLD)
	{
		engOilPressure.addClass('caution');
		$('.statusText', engOilPressure).html('Caution');
	}
	else
	{
		$('.statusText', engOilPressure).html('Normal');
	}

	// Level
	var engOilLevel = $('.statusItem.engineOil.level');
	engOilLevel.removeClass('caution alert');
	if(engOilLevel.data('status') <= VIRTUAL_MECHANIC.SYSTEM_ENGINE_OIL_LEVEL_ALERT_THRESHOLD)
	{
		engOilLevel.addClass('alert');
		$('.statusText', engOilLevel).html('Alert');
	}
	else if(engOilLevel.data('status') <= VIRTUAL_MECHANIC.SYSTEM_ENGINE_OIL_LEVEL_CAUTION_THRESHOLD)
	{
		engOilLevel.addClass('caution');
		$('.statusText', engOilLevel).html('Caution');
	}
	else
	{
		$('.statusText', engOilLevel).html('Normal');
	}
	
	// RPM
	var engineRpm = $('.statusItem.engine.rpm');
	engineRpm.removeClass('caution alert');
	if(engineRpm.data('status') >= VIRTUAL_MECHANIC.SYSTEM_ENGINE_RPM_ALERT_THRESHOLD)
	{
		engineRpm.addClass('alert');
		$('.statusText', engineRpm).html('Alert');
	}
	else if(engineRpm.data('status') >= VIRTUAL_MECHANIC.SYSTEM_ENGINE_RPM_CAUTION_THRESHOLD)
	{
		engineRpm.addClass('caution');
		$('.statusText', engineRpm).html('Caution');
	}
	else
	{
		$('.statusText', engineRpm).html('Normal');
	}
	
	// Transmission
	// Temperature
	var transTemp = $('.statusItem.transmission.temperature');
	transTemp.removeClass('caution alert');
	if(transTemp.data('status') >= VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_TEMPERATURE_ALERT)
	{
		transTemp.addClass('alert');
		$('.statusText', transTemp).html('Alert');
	}
	else if(transTemp.data('status') >= VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_TEMPERATURE_CAUTION)
	{
		transTemp.addClass('caution');
		$('.statusText', transTemp).html('Caution');
	}
	else
	{
		$('.statusText', transTemp).html('Normal');
	}

	// Clutch Wear
	var transClutchWear = $('.statusItem.transmission.clutchWear');
	transClutchWear.removeClass('caution alert');
	if(transClutchWear.data('status') <= VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_CLUTCH_WEAR_ALERT)
	{
		transClutchWear.addClass('alert');
		$('.statusText', transClutchWear).html('Alert');
	}
	else if(transClutchWear.data('status') <= VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_CLUTCH_WEAR_CAUTION)
	{
		transClutchWear.addClass('caution');
		$('.statusText', transClutchWear).html('Caution');
	}
	else
	{
		$('.statusText', transClutchWear).html('Normal');
	}
	
	// Next Service
	var transService = $('.statusItem.transmission.nextService');
	if(transService.data('date'))
	{
		transService.removeClass('caution alert');
		$('.statusText', transService).html(dateToStr(transService.data('date')).substr(0, dateToStr(transService.data('date')).indexOf(' ')));
		if(transService.data('date').getTime() - daysToMs(VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_NEXT_SERVICE_CAUTION_THRESHOLD)
			<= new Date().getTime())
		{
			transService.addClass('caution');
		}
	}
	
	// Current Gear
	var currentGear = $('.currentGear');
	
	// Remove all current gear classes by reverting the element to its base class
	currentGear.attr('class', 'currentGear');

	switch(currentGear.data('status'))
	{
		case VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_GEAR_PARK: currentGear.addClass('park'); break;
		case VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_GEAR_NEUTRAL: currentGear.addClass('neutral'); break;
		case VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_GEAR_REVERSE: currentGear.addClass('reverse'); break;
		case VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_GEAR_DRIVE: currentGear.addClass('drive'); break;
		case VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_GEAR_1: currentGear.addClass('first'); break;
		case VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_GEAR_2: currentGear.addClass('second'); break;
		case VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_GEAR_3: currentGear.addClass('third'); break;
		case VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_GEAR_4: currentGear.addClass('fourth'); break;
		case VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_GEAR_5: currentGear.addClass('fifth'); break;
		case VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_GEAR_6: currentGear.addClass('sixth'); break;
		case VIRTUAL_MECHANIC.SYSTEM_TRANSMISSION_GEAR_7: currentGear.addClass('seventh'); break;
	}

}
