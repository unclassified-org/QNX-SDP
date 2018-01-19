/**
 * Note that this document depends on the following JS files to be loaded BEFOREHAND:
 * - virtualMechanic/brakingSystem.js
 * - virtualMechanic/config.js
 * - virtualMechanic/electricalSystem.js
 * - virtualMechanic/fluids.js
 * - virtualMechanic/powertrainSystem.js
 * - virtualMechanic/tractionSystem.js
 * - virtualMechanic/vehicleStats.js
 */

SENSORS_UPDATE = "sensorsupdate";

function initVirtualMechanics() {
	console.log('Initializing Virtual Mechanic');
	
	// Initialize vehicle sensors
	car.sensors.get(updateVirtualMechanicControlData, function(error) {
		console.error(error.code, error.msg);
	});
	
	// listen for sensors update event
	car.sensors.watchSensors(updateVirtualMechanicControlData);

	// Attach tap handlers for vehicle stats reset buttons
	$('.stat.departureTime .btnReset').tap(resetDepartureTime);
	$('.stat.tripDuration .btnReset').tap(resetTripDuration);
	$('.stat.mileage .btnReset').tap(resetMileage);
	$('.stat.distanceTraveled .btnReset').tap(resetDistanceTraveled);
	$('.stat.avgSpeed .btnReset').tap(resetAvgSpeed);
	
	// Attach tap handlers to vehicle status buttons to show dialogs
	$('#btn_showFluidLevels').tap(function () { showDialog($('#dlg_fluidLevels')); });
	$('#btn_showTractionSystem').tap(function () { showDialog($('#dlg_tractionSystem')); });
	$('#btn_showBrakingSystem').tap(function () { showDialog($('#dlg_brakingSystem')); });
	$('#btn_showPowertrainSystem').tap(function () { showDialog($('#dlg_powertrainSystem')); });
	$('#btn_showElectricalSystem').tap(function () { showDialog($('#dlg_electricalSystem')); });
	$('#btn_showVehicleStats').tap(function () { showDialog($('#dlg_vehicleStats')); });
	$('#btn_showSchedMaint').tap(function () { showDialog($('#dlg_schedMaint')); });

	// Attach tap handler for braking system ABS toggle switch
	$('#btnAbsToggle .btnBase').bind('vmousedown', function () {
		setBrakeAbsSetting(!$(this).parent().data('enabled'));
	});

	// Attach tap handlers to dialog close buttons
	$('.dialog .btnClose').tap(function() {
		hideDialog($(this).parents('.dialog').first());
	});
}

/**
 * Gets the current sensor data from the API, assigns the
 * data to all UI elements and then updates the display.
 */
function updateVirtualMechanicControlData(sensorData)
{	
	if (sensorData == null)
	{
		console.warn('Unable to get init vehicle sensor data');	
	} else {

		// First, since we treat all fluid gauges as generic, we need to set the
		// caution/alert thresholds on the controls themselves so that the display
		// update function can update the display specific to each control
		$('.fluidGauge.windshieldWasher').data('caution', VIRTUAL_MECHANIC.FLUID_WASHER_CAUTION);
		$('.fluidGauge.windshieldWasher').data('alert', VIRTUAL_MECHANIC.FLUID_WASHER_ALERT);
		$('.fluidGauge.transmission').data('caution', VIRTUAL_MECHANIC.FLUID_TRANSMISSION_CAUTION);
		$('.fluidGauge.transmission').data('alert', VIRTUAL_MECHANIC.FLUID_TRANSMISSION_ALERT);
		$('.fluidGauge.fuel').data('caution', VIRTUAL_MECHANIC.FLUID_FUEL_CAUTION);
		$('.fluidGauge.fuel').data('alert', VIRTUAL_MECHANIC.FLUID_FUEL_ALERT);
		$('.fluidGauge.engineCoolant').data('caution', VIRTUAL_MECHANIC.FLUID_ENGINE_COOLANT_CAUTION);
		$('.fluidGauge.engineCoolant').data('alert', VIRTUAL_MECHANIC.FLUID_ENGINE_COOLANT_ALERT);
		$('.fluidGauge.brake').data('caution', VIRTUAL_MECHANIC.FLUID_BRAKE_CAUTION);
		$('.fluidGauge.brake').data('alert', VIRTUAL_MECHANIC.FLUID_BRAKE_ALERT);

		var sensors = Object.keys(sensorData);
		for (var i=0; i<sensors.length; i++) {
			var sensorName = sensors[i];
			var sensorValue = sensorData[sensors[i]];
			switch(sensorName){
				case VIRTUAL_MECHANIC.SENSOR_FLUID_WINDSHIELD_WASHER:
					onWasherFluidLevelChange(sensorValue);
					break;
				case VIRTUAL_MECHANIC.SENSOR_FLUID_TRANSMISSION:
					onTransmissionFluidLevelChange(sensorValue);
					break;
				case VIRTUAL_MECHANIC.SENSOR_FUEL_LEVEL:
					onFuelLevelChange(sensorValue);
					break;
				case VIRTUAL_MECHANIC.SENSOR_FLUID_ENGINE_COOLANT:
					onEngineCoolantLevelChange(sensorValue);
					break;
				case VIRTUAL_MECHANIC.SENSOR_FLUID_BRAKE:
					onBrakeFluidLevelChange(sensorValue);
					break;
				case VIRTUAL_MECHANIC.SENSOR_TIRE_PRESSURE_RL:
				case VIRTUAL_MECHANIC.SENSOR_TIRE_PRESSURE_RR:
				case VIRTUAL_MECHANIC.SENSOR_TIRE_PRESSURE_FL:
				case VIRTUAL_MECHANIC.SENSOR_TIRE_PRESSURE_FR:
					onTirePressureLevelChange(sensorName, sensorValue);
					break;
				case VIRTUAL_MECHANIC.SENSOR_TIRE_WEAR_RL:
				case VIRTUAL_MECHANIC.SENSOR_TIRE_WEAR_RR:
				case VIRTUAL_MECHANIC.SENSOR_TIRE_WEAR_FL:
				case VIRTUAL_MECHANIC.SENSOR_TIRE_WEAR_FR:
					onTireWearLevelChange(sensorName, sensorValue);
					break;
				case VIRTUAL_MECHANIC.SENSOR_BRAKE_WEAR_RL:
				case VIRTUAL_MECHANIC.SENSOR_BRAKE_WEAR_RR:
				case VIRTUAL_MECHANIC.SENSOR_BRAKE_WEAR_FL:
				case VIRTUAL_MECHANIC.SENSOR_BRAKE_WEAR_FR:
					onBrakeWearLevelChange(sensorName, sensorValue);
					break;
				case VIRTUAL_MECHANIC.SENSOR_BRAKE_ABS_RL:
				case VIRTUAL_MECHANIC.SENSOR_BRAKE_ABS_RR:
				case VIRTUAL_MECHANIC.SENSOR_BRAKE_ABS_FL:
				case VIRTUAL_MECHANIC.SENSOR_BRAKE_ABS_FR:
					onBrakeAbsStatusChange(sensorName, sensorValue);
					break;
				case VIRTUAL_MECHANIC.SENSOR_BRAKE_ABS:
					onBrakeAbsSettingChange(sensorValue)
					break;
				case VIRTUAL_MECHANIC.SENSOR_ENGINE_OIL_PRESSURE:
					onEngineOilPressureLevelChange(sensorValue)
					break;
				case VIRTUAL_MECHANIC.SENSOR_ENGINE_OIL_LEVEL:
					onEngineOilLevelChange(sensorValue)
					break;
				case VIRTUAL_MECHANIC.SENSOR_ENGINE_RPM:
					onEngineRpmChange(sensorValue)
					break;
				case VIRTUAL_MECHANIC.SENSOR_TRANSMISSION_TEMPERATURE:
					onTransmissionTemperatureChange(sensorValue)
					break;
				case VIRTUAL_MECHANIC.SENSOR_TRANSMISSION_CLUTCH_WEAR:
					onTransmissionClutchWearChange(sensorValue)
					break;
				case VIRTUAL_MECHANIC.SENSOR_TRANSMISSION_CURRENT_GEAR:
					onTransmissionGearChange(sensorValue)
					break;
				case VIRTUAL_MECHANIC.SENSOR_LIGHT_TAIL_RL:
				case VIRTUAL_MECHANIC.SENSOR_LIGHT_TAIL_RR:
				case VIRTUAL_MECHANIC.SENSOR_LIGHT_HEAD_FL:
				case VIRTUAL_MECHANIC.SENSOR_LIGHT_HEAD_FR:
					onLightStatusChange(sensorName, sensorValue);
					break;
			}
		}
	}

	// TODO: Have the transmission service date come from... somewhere	
	var transmissionServiceDate = new Date();
	transmissionServiceDate.setFullYear(2012);
	transmissionServiceDate.setMonth(1);
	transmissionServiceDate.setDate(20);
	$('.statusItem.transmission.nextService').data('date', transmissionServiceDate);
	
	// Have to manually force update of powertrain display since we just changed
	// the transmission service date
	updateSystemStatusPowertrainDisplay();
	
	// Init Vehicle Status data
	// TODO: Have vehicle status data come from somewhere
	// Departure Time
	$('.stat.departureTime').data('date', new Date());
	// Trip Duration
	$('.stat.tripDuration').data('seconds', 9120);
	// Mileage
	$('.stat.mileage').data('consumption', 13.1);
	// Distance traveled
	$('.stat.distanceTraveled').data('distance', 999);
	// Average speed
	$('.stat.avgSpeed').data('speed', 56.1);
	updateVehicleStatsDisplay();
	
}

/**
 * Shows the specified dialog element
 * @param dialog {Object} The dialog DOM element with class 'dialog'
 */
function showDialog(dialog)
{
	if($(dialog).hasClass('dialog') &&
		!$(dialog).hasClass('visible'))
	{
		$(dialog).addClass('visible');
	}
}

/**
 * Hides the specified dialog element
 * @param dialog {Object} The dialog DOM element with class 'dialog'
 */
function hideDialog(dialog)
{
	if($(dialog).hasClass('dialog') &&
		$(dialog).hasClass('visible'))
	{
		$(dialog).removeClass('visible');
	}
}