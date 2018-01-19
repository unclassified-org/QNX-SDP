/**
 * Event handler for rear defrost HVAC changes.
 * @param e {Event} HVAC change event
 */
function onRearDefrostSettingChange(e)
{
	if(typeof(e) != 'undefined' && typeof(e.zone) != 'undefined' && typeof(e.value) != 'undefined')
	{
		if(validateRearDefrostSetting(e.value))
		{
			$('.defrostToggleControl').data('active', e.value);

			updateRearDefrostDisplay();
		}
	}
}

/**
 * Validates the supplied value as a valid
 * rear defrost setting value.
 * @param value {Boolean} The value to validate
 * @returns {Boolean} True if valid, False if not
 */
function validateRearDefrostSetting(value)
{
	var isValid = true;
	
	if(typeof(value) != 'boolean')
	{
		isValid = false;
		console.error('Unrecognized rear defrost setting HVAC value: ' + value);			
	}
	
	return isValid;
}

/**
 * Toggles the rear defrost setting on or off and persists to the
 * HVAC API.
 * @param enabled {Boolean} True for ON, False for OFF
 */
function setDefrost(enabled)
{
	if(validateRearDefrostSetting(enabled))
	{
		// Persist to API
		try
		{
			car.hvac.set(car.hvac.HvacSetting.DEFROST, car.Zone.ALL, enabled);
		}
		catch(ex)
		{
			console.error('Unable to persist rear defrost change to API', ex);
		}
	}
}

/**
 * Updates the display of the rear defrost control
 */
function updateRearDefrostDisplay()
{
	$('.defrostToggleControl').each(function() {
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
