$(document).ready(function() {

	// Initialize clock
	updateTime(true);

	// Get the current profile & updates
	var currentProfile = qnx.settings.get(['carControl_profile']);
	if(currentProfile != undefined)
	{
		$('body').attr('data-currentProfile', currentProfile);
	}
	else
	{
		console.warn('Status profile undefined!');
	}

	//Get User Updates & Name
	car.profile.watchProfile(onNameChange);
	car.profile.getActive(
		function(profile){
			updateUserNameDisplay(profile.name);
		},
		function(error) {
			console.error(error.code, error.message);
		}
	);

	// Get HVAC Temperature & updates
	car.hvac.watchHvac(onHVACDriverTempChange);
	car.hvac.get(
		function(e){
			onHVACDriverTempChange(e);
		},
		function(error) {
			console.error(error.code, error.message);
		}
	);

	// Get Volume & Volume Updates
	car.audiomixer.watchAudioMixer(function(e){
			onVolumeChange(e);
		},
		function(e){console.error(e)}
	);
	car.audiomixer.get(function(e){
			onVolumeChange(e);
		},
		function(e){console.error(e)}
	);

	// nothing connected at the startup
	updateBluetoothDisplay(false);
	// Get Bluetooth updates & Connected status
	blackberry.event.addEventListener("bluetoothserviceconnected",onBluetoothConnected);
	blackberry.event.addEventListener("bluetoothservicedisconnected",onBluetoothDisconnected);

	// Get MAP/PBAP status updates
	blackberry.event.addEventListener("messageservicestatechange",onMessageStatusChange);
	blackberry.event.addEventListener("bluetoothpbapstatechange",onPhonebookStatusChange);

	//HFP events
	blackberry.event.addEventListener("phonedialing",onPhoneActive);
	blackberry.event.addEventListener("phonecallactive",onPhoneActive);
	blackberry.event.addEventListener("phoneincoming",onPhoneActive);
	blackberry.event.addEventListener("phoneready",onPhoneInactive);
});

/** 
 * Method that updates the time in the status bar
 * @param initialRun {Boolean} Set to true if this is the first time we are setting the time
 */
function updateTime(initialRun)  {
	var	currentTime = new Date(),
		timeSuffix = "AM",
		hour = currentTime.getHours();

	if(currentTime.getHours() > 12) {
		hour = currentTime.getHours() - 12;
	} else {
		if(currentTime.getHours() == 0) {
			hour = 12;
		}
	}

	if(currentTime.getHours() > 11) { 
		timeSuffix = "PM"; 
	}

	$("#environmentData .time").text(
		hour
		+ ":" + (currentTime.getMinutes() < 10 ? "0" + currentTime.getMinutes() : currentTime.getMinutes())
		+ " " + timeSuffix
	);


	//if initialRun, sync to the nearest minute
	if (initialRun) {
		setTimeout(updateTime, (60 - currentTime.getSeconds()) * 1000);
	} else {
		setTimeout(updateTime, 60000);
	}
}

/** 
 * Method called when a volume event is received
 * @param e {Object} the volume event
 */
function onNameChange(e) {
	if (e && e.name) {
		updateUserNameDisplay(e.name);
	}
}

/**
 * Updates the display of the user name
 */
function updateUserNameDisplay(fullName) {
	$("#environmentData .profileName").text(fullName);
}

/** 
 * Method called when an HVAC fan temp event is received
 * @param hvacData {Object} the HVAC fan temp event
 */
function onHVACDriverTempChange(hvacData) {
	if (hvacData != null) {

		for (var i=0; i<hvacData.length; i++) {
			var dataEntry = hvacData[i];
			if(dataEntry.setting == car.hvac.HvacSetting.TEMPERATURE && dataEntry.zone == car.Zone.ROW1_LEFT) {
					updateHVACDriverTempDisplay(dataEntry.value);
			}
		}
	}
}

/**
 * Updates the display of the user name
 */
function updateHVACDriverTempDisplay(temp) {
	$("#environmentData .temperature .value").text(temp);
}

/** 
 * Method called when a volume event is received
 * @param e {Object} the volume event
 */
function onVolumeChange(e) {
	if (e && typeof(e) == "object") {

		for (var i=0; i<e.length; i++) {

			var audioMixerItem = e[i];

			switch(audioMixerItem.setting) {
				case car.audiomixer.AudioMixerSetting.VOLUME:
					updateVolumeSliderDisplay(audioMixerItem.value)
					break;
			}
		}
	}
}

/**
 * Updates the display of the volume slider
 */
function updateVolumeSliderDisplay(value) {
	// roundown to nearest 10 becasue we have 10 assets in the sprite.
	rValue = Math.round(value / 10) * 10;
	$("#volume .level").css("background-position-y", rValue + "%");
}

/**
 * Method called when a bluetooth device serviceconnected event is received
 * @param e {Object} the bluetooth event data
 */
function onBluetoothConnected(e) {
	// doesnt matter what is payload, as long as one service is connect BT considered to be connected
	if (e && e.mac && e.serviceid) {
		updateBluetoothDisplay(true);
	}
}

/**
 * Method called when a bluetooth device servicedisconnected event is received
 * @param e {Object} the bluetooth event data
 */
function onBluetoothDisconnected(e) {
	// doesn't matter what is payload, we have to explicitly call and
	// read status of all BT services to see if anything still connected
	if (e && e.mac && e.serviceid) {
		var services = qnx.bluetooth.getConnectedDevices();

		var connected = false;

		for (var key in services){
			if(services[key].length > 0) {
				connected = true;
				break;
			}
		}

		//if disconnected
		if(!connected) {
			updateBluetoothDisplay(false);
		}
	}
}

/**
 * Event handler for HFP.
 * Invoked when there active phone call (dialout, incoming, active call)
 * @param {Object} e contains phone number
 * example
 * 		{service: "SERVICE_HFP", number: "6137968856"}
 * */
function onPhoneActive(e) {
	$("#phone").addClass("show");
}

/**
 * Event handler for HFP.
 * Invoked when there is a change from active phone call to inactive
 * @param {Object} e contains phone number
 * example
 * 		{service: "SERVICE_HFP", number: "6137968856"}
 * */
function onPhoneInactive(e) {
	$("#phone").removeClass("show");
}

/**
 * Local variable to keep synchronisation status of MAP
 * */
var mapRefreshing = false;
/**
* Local variable to keep synchronisation status of PBAP
 * */
var pbapRefreshing = false;

/**
 * Setter to set value of  pbapRefreshing state and call function to update refresh icon
 * @param: {Boolean} value state of the pbapRefreshing;
 * */
function setPBAPRefreshing(value) {
	pbapRefreshing = value;
	updateSyncDisplay(mapRefreshing || pbapRefreshing);
}

/**
 * Setter to set value of  mapRefreshing state and call function to update refresh icon
 * @param: {Boolean} value state of the mapRefreshing;
 * */
function setMAPRefreshing(value) {
	mapRefreshing = value;
	updateSyncDisplay(mapRefreshing || pbapRefreshing);
}

/**
 * Event handler for Message status changes.
 * Based on status  passed from extension displays or hides spinning arrow
 *
 * @param {String} e contains either qnx.message.STATE_CONNECTING, qnx.message.STATE_CONNECTED or qnx.message.STATE_DISCONNECTED
 * */
function onMessageStatusChange(e) {
	switch(e) {
		case qnx.message.STATE_CONNECTING:
			setMAPRefreshing(true);
			break;
		case qnx.message.STATE_CONNECTED:
			setMAPRefreshing(false);
			updateBluetoothDisplay(true);
			break;
		case qnx.message.STATE_DISCONNECTED:
			setMAPRefreshing(false);
			break;
	}
}

/**
 * Event handler for Phonebook status changes.
 * Based on status  passed from extension displays or hides spinning arrow
 *
 * @param {String} e contains either qnx.bluetooth.pbap.STATE_CONNECTING, qnx.bluetooth.pbap.STATE_CONNECTED or qnx.bluetooth.pbap.STATE_DISCONNECTED
 * */
function onPhonebookStatusChange(e) {
	switch(e) {
		case qnx.bluetooth.pbap.STATE_CONNECTING:
				setPBAPRefreshing(true);
				break;
		case qnx.bluetooth.pbap.STATE_CONNECTED:
				setPBAPRefreshing(false);
				updateBluetoothDisplay(true);
				break;
		case qnx.bluetooth.pbap.STATE_DISCONNECTED:
				setPBAPRefreshing(false);
				break;
	}
}

/**
 * Updates the display of the bluetooth icon
 * @param {Boolean} isConnected true indicated that bluetooth service connected
 */
function updateBluetoothDisplay(isConnected) {
	if(isConnected) {
		$("#bluetooth").addClass("show");
	} else {
		$("#bluetooth").removeClass("show");
		// in case there is service synchronizing during disconnect
		$("#bluetooth").removeClass("syncing");
	}
}

/**
 * Updates the display of the bluetooth icon, displays spinning arrow
 * @param {Boolean} isSyncing true indicates that one or many bluetooth services are synchronising
 */
function updateSyncDisplay(isSyncing) {
	if(isSyncing) {
		$("#bluetooth").addClass("syncing");
	} else {
		$("#bluetooth").removeClass("syncing");
	}
}