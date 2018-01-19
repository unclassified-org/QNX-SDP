/**
 * Minimum heated seat level
 */
CLIMATE_CONTROL.MIN_HEATED_SEAT_LEVEL = 0;

/**
 * Maximum heated seat level
 */
CLIMATE_CONTROL.MAX_HEATED_SEAT_LEVEL = 3;


/**
 * Event handler for heated seat HVAC changes.
 * @param e {Event} HVAC change event
 */
function onHeatedSeatLevelChange(e)
{
	if(typeof(e) != 'undefined' && typeof(e.zone) != 'undefined'  && typeof(e.value) != 'undefined')
	{
		if(validateHeatedSeatLevel(e.value))
		{
			$('.heatedSeatControl[data-zone=' + e.zone + ']').data('level', e.value);
			
			updateHeatedSeatDisplay();
		}
	}
}

/**
 * Validates the supplied value as a valid
 * heated seat level value.
 * @param value {Number} The value to validate
 * @returns {Boolean} True if valid, False if not
 */
function validateHeatedSeatLevel(value)
{
	var isValid = true;
	
	if(typeof(value) != 'number' ||
		isNaN(value) ||
		value < CLIMATE_CONTROL.MIN_HEATED_SEAT_LEVEL ||
		value > CLIMATE_CONTROL.MAX_HEATED_SEAT_LEVEL ||
		value % 1 !== 0)
	{
		isValid = false;
		console.error('Unrecognized heated seat level HVAC value: ' + value);
	}
	
	return isValid;
}


/**
 * Sets the heated seat level for the specified zone and persists
 * the change to the HVAC API
 * @param zone {String} The zone to which the heated seat setting will be applied
 * @param level {Number} The heated seat level (0 is off)
 */
function setHeatedSeatLevel(zone, level)
{
	if(validateHeatedSeatLevel(level))
	{
		try
		{
			// Persist to API
			car.hvac.set(car.hvac.HvacSetting.HEATED_SEAT, zone, level);
		}
		catch(ex)
		{
			console.error('Unable to persist heated seat change to API', ex);
		}
	
	}
}

/**
 * Updates the display of all heated seat controls
 */
function updateHeatedSeatDisplay()
{
	$('.heatedSeatControl').each(function() {
		var level = $(this).data('level');

		// Remove all existing levels
		$(this).removeClass(function(index, css) {
			return (css.match (/\blevel[0-9]+/g) || []).join(' ');
		});

		if(level > 0 && !$(this).hasClass('level' + level))
		{
			$(this).addClass('level' + level)
		}
	});
}
