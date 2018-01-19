/**
 * Event handler for washer fluid level sensor changes.
 * @param value {String} Sensor value
 */
function onWasherFluidLevelChange(value)
{
	if(typeof(value) != 'undefined')
	{
		if(validateFluidLevel(value))
		{
			$('.fluidGauge.windshieldWasher').data('level', value);
			
			updateFluidGaugeDisplay($('.fluidGauge.windshieldWasher'));
		}
	}
}

/**
 * Event handler for transmission fluid level sensor changes.
 * @param value {String} Sensor value
 */
function onTransmissionFluidLevelChange(value)
{
	if(typeof(value) != 'undefined')
	{
		if(validateFluidLevel(value))
		{
			$('.fluidGauge.transmission').data('level', value);
			
			updateFluidGaugeDisplay($('.fluidGauge.transmission'));
		}
	}
}

/**
 * Event handler for fuel level sensor changes. This handler updates
 * both the control in the main view as well as the fluid gauge in the
 * fluid gauge dialog.
 * @param value {String} Sensor value
 */
function onFuelLevelChange(value)
{
	if(typeof(value) != 'undefined')
	{
		if(validateFluidLevel(value))
		{
			$('.fuelGauge').data('level', value);
			updateFuelGaugeDisplay();
	
			$('.fluidGauge.fuel').data('level', value);
			updateFluidGaugeDisplay($('.fluidGauge.fuel'));
		}
	}
}

/**
 * Event handler for engine coolant fluid level sensor changes.
 * @param value {Event} Sensor change event
 */
function onEngineCoolantLevelChange(value)
{
	if(typeof(value) != 'undefined')
	{
		if(validateFluidLevel(value))
		{
			$('.fluidGauge.engineCoolant').data('level', value);
			
			updateFluidGaugeDisplay($('.fluidGauge.engineCoolant'));
		}
	}
}

/**
 * Event handler for brake fluid level sensor changes.
 * @param value {Event} Sensor change event
 */
function onBrakeFluidLevelChange(value)
{
	if(typeof(value) != 'undefined')
	{
		if(validateFluidLevel(value))
		{
			$('.fluidGauge.brake').data('level', value);
			
			updateFluidGaugeDisplay($('.fluidGauge.brake'));
		}
	}
}

/**
 * Generic function to validate fluid level sensor values
 * for ALL fluid types. Currently, all fluid gauges range between
 * 0-100. Additional validation methods can be added to support
 * varying validation rules for different fluid level sensors.
 * @param value {Number} The value to validate
 * @returns {Boolean} True if valid, False if not
 */
function validateFluidLevel(value)
{
	var isValid = true;
	
	if(typeof(value) != 'number' || 
		value < VIRTUAL_MECHANIC.FLUID_GAUGE_MIN ||
		value > VIRTUAL_MECHANIC.FLUID_GAUGE_MAX)
	{
		isValid = false;
		console.error('Unrecognized fluid level sensor value: ' + value);			
	}
	
	return isValid;
}

/**
 * Updates the display of the fuel gauge in the main view
 */
function updateFuelGaugeDisplay()
{
	$('.fuelGauge').each(function() {
		var level = $(this).data('level');

		// Remove all existing levels
		$(this).removeClass(function(index, css) {
			return (css.match (/\blevel[0-9]+/g) || []).join(' ');
		});
		
		if(level > 0)
		{
			$(this).addClass('level' + Math.round(level / VIRTUAL_MECHANIC.FUEL_GAUGE_LEVELS))
		}
	});
}

/**
 * Updates the display of the specified fluid gauge controls, or, if no
 * controls are passed as an argument, all fluid gauges in the fluid gauge dialog.
 * @param ctrls {Object} Optional. The specific fluid gauge control(s) to update
 */
function updateFluidGaugeDisplay(ctrls)
{
	var fluidGaugeCtrls;
	
	if(typeof(ctrls) == 'object')
	{
		fluidGaugeCtrls = ctrls;
	}
	else
	{
		fluidGaugeCtrls = $('.fluidGauge');
	}
	
	$(fluidGaugeCtrls).each(function() {
		var fluidGauge = $(this);
		var displayBar = $('.display > .bar', this);
		
		// Reset classes
		fluidGauge.removeClass('caution alert');
		
		if(fluidGauge.data('level') <= fluidGauge.data('alert'))
		{
			fluidGauge.addClass('alert');
		}
		else if(fluidGauge.data('level') <= fluidGauge.data('caution'))
		{
			fluidGauge.addClass('caution');
		}

		// Transform the height of the bar to reflect the level of the fluid
		displayBar.css('-webkit-transform', 'scale(1, ' + (fluidGauge.data('level') / 100) + ')');
	});
}

/**
 * Assigns a random level value for each fluid gauge between 0-100
 * and then updates the fluid gauge display. Used for testing/demo purposes.
 */
function setRandomFluidLevels()
{
	$('.fluidGauge').each(function(){
		$(this).data('level', Math.random() * VIRTUAL_MECHANIC.FLUID_GAUGE_MAX);
	})
	updateFluidGaugeDisplay();
}