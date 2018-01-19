/**
 * Event handler for zone link HVAC changes.
 * @param e {Event} HVAC change event
 */
function onZoneLinkSettingChange(e)
{
	if(typeof(e) != 'undefined' && typeof(e.value) != 'undefined')
	{
		if(validateZoneLinkSetting(e.value))
		{
			$('.zoneLinkToggleControl').data('active', e.value);
			
			updateZoneLinkDisplay();
			
			
			//Sets the fan temperature, speed, and setting for all zones to that of the
 			// first (driver-side) zone.
			if(e.value){
				setTemperature(undefined, parseInt($('.tempControl:first').data('temp')));
				setFanSpeed(undefined, parseInt($('.fanSpeedControl:first').data('level')));
				setFanSetting(undefined, $('.fanControl:first').data('setting'));
			}
		}
	}
}

/**
 * Validates the supplied value as a valid
 * zone link setting value.
 * @param value {Boolean} The value to validate
 * @returns {Boolean} True if valid, False if not
 */
function validateZoneLinkSetting(value)
{
	var isValid = true;

	if(typeof(value) != 'boolean')
	{
		isValid = false;
		console.error('Unrecognized zone link setting HVAC value: ' + value);
	}

	return isValid;
}

/**
 * Sets the zone link (All) setting and persists to the HVAC API.
 * This will also equalize the data between zones if setting to ON,
 * using the zone of the first temperature and fan speed controls
 * found in the DOM as the baseline.
 * @param enabled {Boolean} True for ON, False for OFF
 */
function setZoneLink(enabled)
{
	if(validateZoneLinkSetting(enabled))
	{
		// Persist to API
		try
		{
			car.hvac.set(car.hvac.HvacSetting.ZONE_LINK, car.Zone.ALL, enabled);
		}
		catch(ex)
		{
			console.error('Unable to persist zone link change to API', ex);
		}
	}
}

/**
 * Updates the display of the zone link (All) toggle control
 */
function updateZoneLinkDisplay()
{
	$('.zoneLinkToggleControl').each(function() {
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
