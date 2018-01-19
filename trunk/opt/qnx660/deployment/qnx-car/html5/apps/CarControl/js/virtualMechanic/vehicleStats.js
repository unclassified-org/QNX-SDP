/**
 * Resets the departure time vehicle statistic to the current date/time
 */
function resetDepartureTime()
{
	$('.vehicleStats .stat.departureTime').data('date', new Date());
	// TODO: Persist to API/storage
	updateVehicleStatsDisplay();
}

/**
 * Resets the trip duration vehicle statistic to 0 seconds
 */
function resetTripDuration()
{
	$('.vehicleStats .stat.tripDuration').data('seconds', 0);
	// TODO: Persist to API/storage
	updateVehicleStatsDisplay();
}

/**
 * Resets the mileage vehicle statistic to 0
 */
function resetMileage()
{
	$('.vehicleStats .stat.mileage').data('consumption', 0);
	// TODO: Persist to API/storage
	updateVehicleStatsDisplay();
}

/**
 * Resets the distance traveled vehicle statistic to 0
 */
function resetDistanceTraveled()
{
	$('.vehicleStats .stat.distanceTraveled').data('distance', 0);
	// TODO: Persist to API/storage
	updateVehicleStatsDisplay();
}

/**
 * Resets the average speed vehicle statistic to 0
 */
function resetAvgSpeed()
{
	$('.vehicleStats .stat.avgSpeed').data('speed', 0);
	// TODO: Persist to API/storage
	updateVehicleStatsDisplay();
}

/**
 * Updates the display of all vehicle statistics
 */
function updateVehicleStatsDisplay()
{
	// Departure Time
	// TODO: Format the date/time to align with design (e.g. time zone)
	var departureTime = $('.vehicleStats .stat.departureTime');
	$('.data', departureTime).html(dateToStr(departureTime.data('date')).replace(/ /, '<br />'));
	
	// Trip Duration
	var tripDuration = $('.vehicleStats .stat.tripDuration');
	var tripDurHours = tripDuration.data('seconds') / (60*60);
	var tripDurTimeStr = Math.floor(tripDurHours) + ' Hour' + (Math.floor(tripDurHours) != 1 ? 's' : '') + '<br />';
	tripDurTimeStr += Math.floor((tripDurHours - Math.floor(tripDurHours)) * 60) + ' Minute' + (Math.floor((tripDurHours - Math.floor(tripDurHours)) * 60) != 1 ? 's' : '');
	$('.data', tripDuration).html(tripDurTimeStr);
	
	// Mileage
	var mileage = $('.vehicleStats .stat.mileage');
	$('.data', mileage).html(mileage.data('consumption') + ' ' + VIRTUAL_MECHANIC.VEHICLE_STATS_MILEAGE_CONSUMPTION_UNIT +
		' / ' + VIRTUAL_MECHANIC.VEHICLE_STATS_MILEAGE_CONSUMPTION_PER);
		
	// Distance Traveled
	var distTrav = $('.vehicleStats .stat.distanceTraveled');
	$('.data', distTrav).html(distTrav.data('distance') + ' ' + VIRTUAL_MECHANIC.VEHICLE_STATS_DISTANCE_UNIT);
	
	// Average Speed
	var avgSpeed = $('.vehicleStats .stat.avgSpeed');
	$('.data', avgSpeed).html(avgSpeed.data('speed') + ' ' + VIRTUAL_MECHANIC.VEHICLE_STATS_AVG_SPEED_UNIT + ' / hr');

}
