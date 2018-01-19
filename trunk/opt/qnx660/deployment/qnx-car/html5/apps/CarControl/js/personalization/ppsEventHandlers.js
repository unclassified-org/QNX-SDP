// $Id: ppsEventHandlers.js 6626 2013-06-20 14:26:44Z mlytvynyuk@qnx.com $

/** 
 * Method called when a theme event is received
 * @param e {Object} the theme event
 */
function onThemeChange(e) {
	// If the actual theme attribute was changed
	if(e.theme) {
		// Update the database
		Personalization.Data.Writer.updateProfileAttributes({
			"theme": e.theme
		});

		// Update the UI
		$("#personalization #personalizationCtrlTheme").val(e.theme).trigger("change");
	}

	// Hide the loading animation once the theme switching process is complete.
	loadingOverlay({action: "hide"});
};

/**
 * Event handler for Bluetooth event for retrieving paired devices ( to get list of devices up to date)
 */
function onBluetoothPair() {
	generatePreferredDeviceList(Personalization.PPS.Reader.getPairedDevices()); // Regenerate the list of paired devices
	updateModalBlade($("#personalization #personalizationCtrlPreferredDevice")) //Force the Blade to update its list
}

/**
 * Event listener callback of the bluetooth PPS object
 */
function onBluetoothUnpair(e) {
		Personalization.Data.Writer.resetProfilePreferredDevice(e);
		generatePreferredDeviceList(Personalization.PPS.Reader.getPairedDevices()); // Regenerate the list of paired devices
		updateModalBlade($("#personalization #personalizationCtrlPreferredDevice")) //Force the Blade to update its list
}

/**
 * Dynamically generate all the necessary event listeners for the settings defined in the field mapping provided
 * 
 * @param settingsMapping {Object} all the necessary mapping information to relate a PPS attribute to a db setting
 */
function initializeSettingsEventHandling(settingsMapping) {
	// Function to forward the PPS data to the database
	var ppsUpdateListenerGenerator = function(eventName) {
		return function(eventData) {
			try {
				var mapping = Personalization.getSettingsMapping()[eventName]; // Base settings for the fired event
				var fieldMappings = mapping.fieldMapping; // The list of fields mapped for a given event

				// This condition is used to handle exception cases where the PPS object is returning just a value OR
				// is returning an object where the property name is of no real significance in that it doesn't match any
				// of the predefined mapping data.
				if(mapping.ignoreFieldMappingMatch) {
					var field = {};
					var attributeKey = "";
					var attributeValue;

					// If the event data is an object, ignore the property name and extract the value, else, save the value
					// from the primitive type
					if(typeof eventData === "object") {
						// A "for...in" loop is the only construct available to get properties of an object without
						// knowing the names. This loop will only run once to get the first property.
						for(var attributeKey in eventData) {
							attributeValue = eventData[attributeKey];

							break;
						}
					} else {
						attributeValue = eventData;
					}

					// A "for...in loop" is the only construct available to get properties of an object without
					// knowing the names. This loop will only run once to get the first property.
					// ** Extract the PPS field name to use to when performing operations for the current event
					for(var fieldKey in mapping.fieldMapping) {
						field = mapping.fieldMapping[fieldKey];
						attributeKey = field.ppsField;

						break;
					}

					processField(field, attributeKey, attributeValue, true);
				} else {
					// Loop through each attribute defined in the event data
					for(var attributeKey in eventData) {
						var changeValue = eventData[attributeKey];
						// make attributeKeyAdapted to be compatible with new PPS conventions
						var attributeKeyAdapted = changeValue.setting + "_" + changeValue.zone;
						// extract fields descriptor
						var field = fieldMappings[attributeKeyAdapted];
						var attributeValue = changeValue.value;

						// If the PPS attribute has a matching field in the mapping
						if(fieldMappings.hasOwnProperty(attributeKeyAdapted)) {
							processField(field, attributeKeyAdapted, attributeValue);
						}
					}
				}
			} catch(err) {
				console.error("File: ppsEventHandlers.js, ppsUpdateListenerGenerator() - ", err);
			}
		};
	};

	//Loop through each API mapping defined in the "mapping" variable
	for(setting in settingsMapping) {
		// Initialize event listener for the given resource (ie. Mixer, HVAC, etc.)
		var extension = settingsMapping[setting].extensionName;
		var evalString = extension + "." + setting;
		var func = eval(evalString);
		func(ppsUpdateListenerGenerator(setting));
	}
}

/**
 * Performs the necessary logic to populate a post event stack OR clean up the main event stack that will determine
 * when all DB to PPS callbacks are completed.
 * 
 * @param field {Object} field from the settings mapping
 * @param attributeKey {String} name of the PPS event property
 * @param attributeValue {Any} value of the PPS event property
 * @param ignoreFieldMappingMatch {Boolean} identifies whether this field is an exception case or a standard PPS key/value pair
 */
function processField(field, attributeKey, attributeValue, ignoreFieldMappingMatch) {
	try {
		var eventStack = Personalization.getEventStack(); // Local reference the event stack
		var profileId = Personalization.getCurrentProfile().id;

		// If the event stack is empty, push the PPS data directly to the database - this generally signifies that the profile
		// has been completely loaded and the application should be storing any changes to defined PPS properties
		if(Object.keys(eventStack).length === 0) {
			var tmVal;
			tmVal = attributeValue;

			// Stringify an object value to prevent losing it's formatting
			if(typeof attributeValue === "object") {
				tmVal = JSON.stringify(attributeValue);
			}

			Personalization.Data.Writer.setSettings(field.dbField, tmVal);
		} else {
			// If the attribute exists in the stack
			if(eventStack[field.event] && eventStack[field.event].hasOwnProperty(attributeKey)) {
				// If the stack event value equals the PPS attribute value - it's assumed that data equal
				// in value was what was just pushed into PPS from the database
				if(
					(!ignoreFieldMappingMatch
						&& ((typeof attributeValue === "object" && compareObjects(eventStack[field.event][attributeKey], attributeValue))
						|| eventStack[field.event][attributeKey] == attributeValue))
					|| (ignoreFieldMappingMatch
						&& eventStack[field.event][attributeKey] == attributeValue)
				) {
					// Remove event from stack
					Personalization.removeStackEvent(field.event, field.ppsField);

					// If this was the last event to be removed from the stack, process
					// any/all post events
					if(Object.keys(eventStack).length === 0) {
						processPostEventStack();
					}
				} else {
					//console.warn("Values don't match - add to post event stack", field.event, attributeKey, attributeValue);
					// The value of the PPS attribute did not match the value in the event stack. This usually
					// indicates that the event was fired during a profile switch process.
					Personalization.addStackPostEvent(profileId, field.event, attributeKey, attributeValue);
				}
			} else {
				// The event fired has a property that's not in the event stack usually meaning that it was not
				// just updated by DB data
				Personalization.addStackPostEvent(profileId, field.event, attributeKey, attributeValue);
			}
		}
	} catch(err) {
		console.error("File: ppsEventHandlers.js, processField() - ", err);
	}
}

/**
 * Run through all the settings that were put in a post status. These settings would be from events
 * that were fired during a profile load that weren't the result of a database push to PPS.
 */
function processPostEventStack() {
	try {
		var postEventStack = Personalization.getPostEventStack();
		var dbSettingsCollection = {};

		// Loop through the profiles to make sure settings are not injected into the wrong one
		for(profileKey in postEventStack) {
			for(eventKey in postEventStack[profileKey]) {
				for(propertyKey in postEventStack[profileKey][eventKey]) {
					var field = Personalization.getSettingsMapping()[eventKey].fieldMapping[propertyKey];
					var fieldValue = postEventStack[profileKey][eventKey][propertyKey];

					if(field.dataType == "json") {
						fieldValue = JSON.stringify(fieldValue);
					}
	
					// Update settings in db
					Personalization.Data.Writer.setSettings(field.dbField, fieldValue);
				}
			}
		}
	} catch(err) {
		console.error("File: ppsEventHandlers.js, processPostEventStack() - ", err);
	} finally {
		// Garbage collection - empty object to ensure the same data doesn't get processed again and 
		// again every time a profile is switched
		Personalization.clearPostEventStack();

		// Unlock the UI
		loadingOverlay({action: "hide"});
	}
}

/**
 * Populate the event stack with all the settings coming from the database
 * 
 * @param settings {Object} settings from the database for the current user
 */
function populateEventStack(settings) {
	var keys = Object.keys(settings);
	for (var i=0; i<settings.length; i++) {
		var field = Personalization.getSettingsMappingDBHash()[settings[i].key];

		// If the setting exist as a field in the mapping
		if (field) {
			var setter = eval(field.setterMethod); // TODO: Why?
			var fieldValue = typeCast(field.dataType, settings[keys[i]])

			// Add the setting to the event stack
			Personalization.addStackEvent(field.event, field.ppsField, fieldValue);
		}
	}
}