/**
 * Event handler for air circulation HVAC changes.
 * @param e {Event} HVAC change event
 */
function onAirCirculationSettingChange(e)
{
	if(typeof(e) != 'undefined' && typeof(e.value) != 'undefined')
	{
		if(validateAirCirculationSetting(e.value))
		{
			$('.airCirculationToggleControl').data('active', e.value);

			updateAirCirculationDisplay();
		}
	}
}

/**
 * Validates the supplied value as a valid
 * air circulation setting value.
 * @param value {Boolean} The value to validate
 * @returns {Boolean} True if valid, False if not
 */
function validateAirCirculationSetting(value)
{
	var isValid = true;
	
	if(typeof(value) != 'boolean')
	{
		isValid = false;
		console.error('Unrecognized air circulation setting HVAC value: ' + value);			
	}
	
	return isValid;
}

/**
 * Toggles the air circulation setting to circulate
 * or external, and also persists to the HVAC API.
 * @param value {Boolean} True for external, False for circulate
 */
function setAirCirculation(value)
{
	if(validateAirCirculationSetting(value))
	{
		try {
			// Persist to API
			car.hvac.set(car.hvac.HvacSetting.AIR_RECIRCULATION, car.Zone.ALL, value);
		} catch(ex) {
			console.error('Unable to persist air circulation change to API', ex);
		}
	}
}

/**
 * Updates the display of the air circulation control
 */
function updateAirCirculationDisplay()
{
	$('.airCirculationToggleControl').each(function() {
		if($(this).data('active'))
		{
			$(this).addClass('active');
		}
		else
		{
			$(this).removeClass('active');
		}
	});
}