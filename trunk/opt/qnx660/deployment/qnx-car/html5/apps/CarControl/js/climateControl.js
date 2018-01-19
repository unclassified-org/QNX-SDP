
/**
 * Namespace object for Climate Control
 * will contains all necessary properties and configs
 */
var CLIMATE_CONTROL = {};

/**
 * Determines if the Climate Control sub-page has been initialized (loaded), and
 * ensures initialization occurs either immediately, or once the page is ready.
 */
function initClimateControl() {
	// Initialize vehicle sensor API and attach callback functions
	console.log('Initializing Climate Control');
	
	HVAC_UPDATE = "hvacupdate";
	// Setup watch to intercept HVAC values changing
	// Fan temp
	car.hvac.watchHvac(updateClimateControlData);

	
	// Insert temperature li elements based on min/max temp configuration
	$('.tempControl .temperature ul').each(function() {
		for(var i=CLIMATE_CONTROL.MIN_TEMP; i<=CLIMATE_CONTROL.MAX_TEMP; i+=CLIMATE_CONTROL.TEMP_INCREMENT)
		{
			$(this).append('<li>' + i + '<span class="degree">&deg;C</span></li>');
		}
	});

	// Add handlers for HMI interactivity
	/* Temperature Controls */
	// Initialize the temperature settings for the controls to the min temp
	$('.tempControl').bind('vmousedown', startTempCtrlDrag);
	$('.tempControl').bind('vmouseup', finishTempCtrlDrag);
	$('.tempControl').bind('vmousemove', tempCtrlDrag);
	
	/* Heated seat controls */
	$('.heatedSeatControl').tap(function() {
		var currLevel = $(this).data('level');
		var newLevel;
		
		if(typeof(currLevel) == 'undefined')
		{
			// If the current level isn't set, assume it was 0
			newLevel = 1;
		}
		else if(currLevel == CLIMATE_CONTROL.MAX_HEATED_SEAT_LEVEL)
		{
			// If we've exceeded max, reset to 0
			newLevel = 0;
		}
		else
		{
			newLevel = currLevel + 1;
		}
		
		setHeatedSeatLevel($(this).attr('data-zone'), newLevel);
	});
	
	
	/* Fan Speed Controls */
	// Bind vmousedown handler
	$('.fanSpeedControl').tap(function() {
		var currSpeed = $(this).data('level');
		var newSpeed;

		if(typeof(currSpeed) == 'undefined')
		{
			newSpeed = 0; 
		}
		if(currSpeed >= CLIMATE_CONTROL.MAX_FAN_SPEED)
		{
			newSpeed = 0;
		}
		else
		{
			newSpeed = currSpeed + 1;
		}

		setFanSpeed($(this).attr('data-zone'), newSpeed)
	});
	
	/* Zone link toggle control */
	$('.zoneLinkToggleControl').tap(function() {
		var active = $(this).data('active');
		if(active == undefined)
		{
			active = false;
		}
		setZoneLink(!active);
	});
	
	/* A/C toggle control */
	$('.acToggleControl').tap(function() {
		var active = $(this).data('active');
		if(active == undefined)
		{
			active = false;
		}
		setAirConditioning(!active);
	});
	
	/* Defrost toggle control */
	$('.defrostToggleControl').tap(function() {
		var active = $(this).data('active');
		if(active == undefined)
		{
			active = false;
		}
		setDefrost(!active);
	});

	/* Air circulation toggle control */
	$('.airCirculationToggleControl').tap(function() {
		var active = $(this).data('active');
		if(active == undefined)
		{
			active = false;
		}
		setAirCirculation(!active);
	});

	/* Fan setting control dials */
	
	// Default the currentRotation value for the dials. This value is used
	// to determine the deltas for mousemove rotation functionality.
	$('.fanControl .dial, .fanControl .dialActive').each(function() {
		$(this).data('currentRotation', 0);
	});

	// Attach high profile user interactivity handlers
	$('body[data-currentProfile=high] .fanControl').bind('vmousedown', startFanControlRotate);
	$('body[data-currentProfile=high] .fanControl').bind('vmouseup', stopFanControlRotate);
	$('body[data-currentProfile=high] .fanControl').bind('vmousemove', rotateFanControl);

	// Attach low profile user interactivity handlers
	$('body[data-currentProfile=mid] .fanControl').bind('tap', onFanControlTap);
	
	// We initialize the hvac data

	car.hvac.get(updateClimateControlData, errorUpdatingClimateControlData);
}

function errorUpdatingClimateControlData(errorData) {
	console.log(errorData);
}

/**
 * Gets the current HVAC data from the API, assigns the
 * data to all UI elements and then updates the display.
 */
function updateClimateControlData(hvacData)
{
	if(hvacData == null)
	{
		console.warn('Unable to update HVAC data');
	}else {
		//iterate through all the hvac items
		for (var i=0; i<hvacData.length; i++) {

			var dataEntry = hvacData[i];

			switch (dataEntry.setting) {
				case car.hvac.HvacSetting.FAN_SPEED :
					onFanSpeedChange(dataEntry);
					break;
				case car.hvac.HvacSetting.FAN_DIRECTION :
					onFanSettingChange(dataEntry);
					break;
				case car.hvac.HvacSetting.AIR_RECIRCULATION :
					onAirCirculationSettingChange(dataEntry);
					break;
				case car.hvac.HvacSetting.AIR_CONDITIONING :
					onAirConditioningSettingChange(dataEntry);
					break;
				case car.hvac.HvacSetting.ZONE_LINK :
					onZoneLinkSettingChange(dataEntry);
					break;
				case car.hvac.HvacSetting.TEMPERATURE :
					onFanTemperatureChange(dataEntry);
					break;
				case car.hvac.HvacSetting.HEATED_SEAT :
					onHeatedSeatLevelChange(dataEntry);
					break;
				case car.hvac.HvacSetting.DEFROST :
					onRearDefrostSettingChange(dataEntry);
					break;
			}
		}
	}
}