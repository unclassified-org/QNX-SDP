/**
 * Event handler for air conditioning HVAC changes.
 * @param e {Event} HVAC change event
 */
function onAirConditioningSettingChange(e)
{
	if(typeof(e) != 'undefined' && typeof(e.value) != 'undefined')
	{
		if(validateAirConditioningSetting(e.value))
		{
			$('.acToggleControl').data('active', e.value);

			updateAirConditioningDisplay();
		}
	}
}

/**
 * Validates the supplied value as a valid
 * air conditioning setting value.
 * @param value {Boolean} The value to validate
 * @returns {Boolean} True if valid, False if not
 */
function validateAirConditioningSetting(value)
{
	var isValid = true;
	
	if(typeof(value) != 'boolean')
	{
		isValid = false;
		console.error('Unrecognized air conditioning setting HVAC value: ' + value);			
	}
	
	return isValid;
}

/**
 * Toggles the AC setting on or off and persists to the
 * HVAC API.
 * @param enabled {Boolean} True for ON, False for OFF
 */
function setAirConditioning(enabled)
{
	if(validateAirConditioningSetting(enabled))
	{
		try {
			// Persist to API
			car.hvac.set(car.hvac.HvacSetting.AIR_CONDITIONING, car.Zone.ALL, enabled);
		} catch(ex) {
			console.error('Unable to persist air conditioning change to API', ex);
		}
	}
}

/**
 * Updates the display of the AC toggle control
 */
function updateAirConditioningDisplay()
{
	$('.acToggleControl').each(function() {
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