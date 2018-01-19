/**
 * Climate Control fan speed control event handlers, data persistence, and
 * display update functions.
 *
 * @author lgreenway@lixar.com
 * 
 * $Id: fanSpeed.js 6214 2013-05-10 14:30:32Z mlytvynyuk@qnx.com $
 */

/**
 * Minimum fan speed
 */
CLIMATE_CONTROL.MIN_FAN_SPEED = 0;

/**
 * Maximum fan speed
 */
CLIMATE_CONTROL.MAX_FAN_SPEED = 6;
	

/**
 * Event handler for fan speed HVAC changes.
 * @param e {Event} HVAC change event
 */
function onFanSpeedChange(e)
{
	if(typeof(e) != 'undefined' && typeof(e.zone) != 'undefined'  && typeof(e.value) != 'undefined')
	{
		var zoneLinkActive = $('.zoneLinkToggleControl').data('active');
		if(validateFanSpeed(e.value))
		{
			$('.fanSpeedControl[data-zone=' + e.zone + ']').data('level', e.value);
		}

		// Set the fan speed for the other zones
		if(zoneLinkActive && e.zone == car.Zone.ROW1_LEFT && $('.fanSpeedControl[data-zone=' + car.Zone.ROW1_RIGHT + ']').data('level') != e.value)
		{
			setFanSpeed(car.Zone.ROW1_RIGHT, e.value);
		}

		if(zoneLinkActive && e.zone == car.Zone.ROW1_RIGHT && $('.fanSpeedControl[data-zone=' + car.Zone.ROW1_LEFT + ']').data('level') != e.value)
		{
			setFanSpeed(car.Zone.ROW1_LEFT, e.value);
		}
		updateFanSpeedDisplay();
	}
	else
	{
		console.warning('Fan speed change event for unknown zone: ' + e);
	}
}

/**
 * Validates the supplied value as a valid
 * fan speed value.
 * @param value {Number} The value to validate
 * @returns {Boolean} True if valid, False if not
 */
function validateFanSpeed(value)
{
	var isValid = true;
	
	if(typeof(value) != 'number' ||
		isNaN(value) ||
		value < CLIMATE_CONTROL.MIN_FAN_SPEED ||
		value > CLIMATE_CONTROL.MAX_FAN_SPEED ||
		value % 1 !== 0)
	{
		isValid = false;
		console.error('Unrecognized fan speed HVAC value: ' + value);			
	}
	
	return isValid;
}

/**
 * Sets the fan speed level for the specified zone and updates 
 * the fan speed control display list
 * @param zone {String} The zone to which the fan speed setting will be applied.
 * If the Zone Link option is set to true, the function will set the specified level
 * on ALL zones.
 * @param level {Number} The fan speed level (0 is off)
 */
function setFanSpeed(zone, level)
{
	if(validateFanSpeed(level))
	{
		if(zone != undefined && zone != ''
				&& !$('.zoneLinkToggleControl').data('active'))
		{
			try
			{
				// Persist to API
				car.hvac.set(car.hvac.HvacSetting.FAN_SPEED, zone, level);
			}		
			catch(ex)
			{
				console.error('Unable to persist fan speed change to API', ex);
			}
		}
		else
		{
			try
			{
				// Both fan speeds get updated since the zones are linked
				car.hvac.set(car.hvac.HvacSetting.FAN_SPEED, car.Zone.ROW1_LEFT, level);
				car.hvac.set(car.hvac.HvacSetting.FAN_SPEED, car.Zone.ROW1_RIGHT, level);
			}
			catch(ex)
			{
				console.error('Unable to persist fan speed change to API', ex);
			}
		}
	
	}
}

/**
 * Updates the display of all fan speed controls
 */
function updateFanSpeedDisplay()
{
	$('.fanSpeedControl').each(function() {
		var level = $(this).data('level');

		// Remove all existing levels
		$(this).removeClass(function(index, css) {
			return (css.match (/\blevel[0-9]+/g) || []).join(' ');
		});
		
		if(level > 0)
		{
			$(this).addClass('level' + level)
		}
	});
}