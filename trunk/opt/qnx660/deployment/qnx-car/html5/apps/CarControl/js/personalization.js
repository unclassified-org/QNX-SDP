// $Id: personalization.js 7349 2013-10-15 19:57:32Z mlapierre@qnx.com $
var Personalization = new function() {
	var self = this;
	var startElementY = 0;
	var clientDeltaY= 0;
	var elementY = 0;
	var wrapperHeight = 0;
	var listHeight = 0;
	var rangeMaxY = 0;
	var isFirstRun = true;
	var isNewProfile = true;
	var isSelectingProfile = false;
	var profileWasDeleted = false;
	var lastProfileSelectedIndex = null;
	var currentProfile = {};
	var settingsMapping = {} // Mapping of PPS objects and their respective attributes to the database and save settings
	var settingsMappingDBHash = {}; // Hash map defining relationship between PPS and DB for settings
	var settingsMappingPPSHash = {}; // Hash map defining relationship between PPS and DB for settings
	// Maintains a stack of events that the personalization application uses to maintain a state when data is pushed from
	// DB to PPS. This stack will fill up with all PPS attributes that are going to get set and will persists until the events
	// for those PPS attributes are triggered.
	var eventStack = {};
	// Maintains a stack of all events that occur between the time the settings are pushed to PPS from DB and the subsequent events
	// get fired back to the application
	var postEventStack = {};
	
	/**
	 * Expands the detail on the personalization namespace
	 */
	self.ns = function(ns) {
		var pieces = ns.split(".");
		var currentNS = "Personalization";
		for (var i = 1; i < pieces.length; i++) {
			if (!eval([currentNS, pieces[i]].join("."))) {
				eval(currentNS)[pieces[i]] = {};
			}
			currentNS += "." + pieces[i];
		}
	};

	/**********************************************************************
	 * BEGIN - PPS event listening methods
	 **********************************************************************/
	self.getEventStack = function() {
		return eventStack;
	}

	// Add an element to the stack
	self.addStackEvent = function(event, key, value) {
		eventStack[event] = eventStack[event] || {};
		eventStack[event][key] = value;
	}

	self.removeStackEvent = function(event, key) {
		// Remove the setting from the stack
		delete eventStack[event][key];

		// Remove the event from the stack if it has no children
		if(Object.keys(eventStack[event]).length === 0) {
			delete eventStack[event];
		}
	}
	
	self.clearEventStack = function() {
		eventStack = {};
	}

	self.getPostEventStack = function() {
		return postEventStack;
	}

	/**
	 * Add an element to the post stack. Structure will look something similar to this:
	 * 
	 * 		{
	 * 			1: {									// Profile ID
	 * 				eventName: {						// Name of the event
	 * 					settingName: settingValue,		// Property and value of the event data
	 * 					settingName: settingValue
	 *				}
	 *			},
	 *			2: {
	 * 				eventName: {
	 * 					settingName: settingValue,
	 * 					settingName: settingValue
	 *				}
	 *			},
	 *		}
	 *
	 * A structure where the primary key is the profile allows for a more accurate process
	 * for pushing data to the database in that data cannot be injected into one profile
	 * when it was meant for another. This is especially an issue when the "timeout" when 
	 * switching profiles is triggered.
	 */
	self.addStackPostEvent = function(profileId, event, key, value) {
		postEventStack[profileId] = postEventStack[profileId] || {}; // Create the profile structure
		postEventStack[profileId][event] = postEventStack[profileId][event] || {}; // Create the event name structure
		postEventStack[profileId][event][key] = value; // Create the key/value pair
	}
	
	self.clearPostEventStack = function() {
		postEventStack = {};
	}

	self.isEventListeningEnabled = function() {
		if(eventStack.length < 1) {
			return true;
		}

		return false;
	}
	/**********************************************************************
	 * END - PPS event listening methods
	 **********************************************************************/

	/**********************************************************************
	 * BEGIN - Mapping methods
	 **********************************************************************/
	self.setSettingsMapping = function(tmpSettingsMapping) {
		settingsMapping = tmpSettingsMapping;
	}

	self.getSettingsMapping = function() {
		return settingsMapping;
	}

	self.getSettingsMappingDBHash = function() {
		return settingsMappingDBHash;
	}

	self.getSettingsMappingPPSHash = function() {
		return settingsMappingPPSHash;
	}

	self.generateSettingsHashMaps = function(tmpSettingsMapping) {
		// For each setting in the mapping
		for(var eventKey in tmpSettingsMapping) {
			var event = tmpSettingsMapping[eventKey];

			// For each field of a setting in the map, store it in a hash
			for(var fieldKey in event.fieldMapping) {
				var field = event.fieldMapping[fieldKey];
				settingsMappingDBHash[field.dbField] = field;
				settingsMappingDBHash[field.dbField]["ppsField"] = fieldKey;
				settingsMappingDBHash[field.dbField]["event"] = eventKey;

				settingsMappingPPSHash[fieldKey] = field;
			}
		}
	}
	/**********************************************************************
	 * END - Mapping methods
	 **********************************************************************/

	/**********************************************************************
	 * BEGIN - UI management methods
	 **********************************************************************/
	self.isFirstRun = function() {
		return isFirstRun;
	}

	self.setIsFirstRun = function(arg) {
		isFirstRun = arg;
	}

	self.isNewProfile = function() {
		return isNewProfile;
	}

	self.setIsNewProfile = function(arg) {
		isNewProfile = arg;
	}

	self.isSelectingProfile = function() {
		return isSelectingProfile;
	}

	self.setIsSelectingProfile = function(arg) {
		isSelectingProfile = arg;
	}

	self.profileWasDeleted = function() {
		return profileWasDeleted;
	}

	self.setProfileWasDeleted = function(arg) {
		profileWasDeleted = arg;
	}

	self.getLastProfileSelectedIndex = function() {
		return lastProfileSelectedIndex;
	}

	self.setLastProfileSelectedIndex = function(arg) {
		lastProfileSelectedIndex = arg;
	}

	self.getCurrentProfile = function() {
		return currentProfile;
	}

	/**
	 * Updates the local profile obj
	 * 
	 * @param profile {Object} profile details
	 * 		Example:
	 * 			{
	 * 				id: {Number},
	 * 				fullName: {String},
	 * 				avatar: {String},
	 * 				deviceId: {String},
	 *				theme: {String}
	 * 			}
	 */
	self.setCurrentProfile = function(profile) {
		try {
			if(
				typeof profile.id !== "undefined"
				&& typeof profile.name !== "undefined"
				&& typeof profile.avatar !== "undefined"
			) {
				currentProfile = profile;
			} else {
				throw("Profile object provided is missing key data.");
			}
		} catch(err) {
			console.error("File: personalization.js, setCurrentProfile() - ", err);
		}
	}

	self.getStartElementY = function() {
		return startElementY;
	};
	self.setStartElementY = function(value) {
		startElementY = value;
	};

	self.getClientDeltaY = function() {
		return clientDeltaY;
	};
	self.setClientDeltaY = function(value) {
		clientDeltaY = value;
	};

	self.getElementY = function() {
		return elementY;
	};
	self.setElementY = function(value) {
		elementY = value;
	};

	self.getWrapperHeight = function() {
		return wrapperHeight;
	};
	self.setWrapperHeight = function(value) {
		wrapperHeight = value;
	};

	self.getListHeight = function() {
		return listHeight;
	};
	self.setListHeight = function(value) {
		listHeight = value;
	};

	self.getRangeMaxY = function() {
		return rangeMaxY;
	};
	self.setRangeMaxY = function(value) {
		rangeMaxY = value;
	};
	/**********************************************************************
	 * BEGIN - UI management methods
	 **********************************************************************/
}

// When the DOM and all UI components are loaded and have had their dimensions calculated
$(document).delegate("#personalization", "pageshow", function() {
	// Store the initial dimensions of the profile list
	setProfileListDimensions();

	// Ensure the selected profile element is fully viewable when loading the personalization page
	displayProfileListItem();
});

// When fragment loaded/ready
function initPersonalization() {
	console.log("Initializing Personalization");

	try {
		if (window.cordova) {
			document.addEventListener("bluetoothnewpaireddevice", onBluetoothPair); // Bluetooth PPS listener for paired devices ( to get list of devices up to date)
			document.addEventListener("bluetoothpairingcomplete", onBluetoothPair); // Bluetooth PPS listener for paired pairing complete
			document.addEventListener("bluetoothpaireddevicedeleted", onBluetoothUnpair);  // Bluetooth PPS listener for deleted devices
		} else {
			blackberry.event.addEventListener("bluetoothnewpaireddevice", onBluetoothPair); // Bluetooth PPS listener for paired devices ( to get list of devices up to date)
			blackberry.event.addEventListener("bluetoothpairingcomplete", onBluetoothPair); // Bluetooth PPS listener for paired pairing complete
			blackberry.event.addEventListener("bluetoothpaireddevicedeleted", onBluetoothUnpair);  // Bluetooth PPS listener for deleted devices
		}
/*
		// watching theme the theme update and updating current profile
		car.theme.watchTheme(function(theme){
			var profile = Personalization.getCurrentProfile();
			if(typeof profile != "undefined") {
				// Change only when theme is different
				if(profile.theme !=  theme.id) {
					profile.theme = theme.id;
					//save profile details in DB
					Personalization.Data.Writer.updateProfileAttributes(profile);
					Personalization.PPS.Writer.updateProfile(profile);
					// update UI to reflect latest changes
					updateThemeUI(profile);
				}
			}
		});
*/
		car.profile.watchProfile(function(profile){
			var activeProfile = Personalization.getCurrentProfile();
			if(typeof activeProfile != "undefined" && activeProfile.id != profile.id) {
				updateUIFromDb(profile);
			}
		});

		// Load the forms lib that will update the look and feel of form controls. This inclusion must be done
		// programmatically in a specific linear execution of else a race condition will occur and the UI elements
		// will not get updated as required.
		$.ajax({ url: 'js/personalization/forms.js', async: false, dataType: "script", cache: true, error: function(xhr, ajaxOptions, thrownError) { console.error("Loading 'forms.js':", thrownError); } });
		// Load the UI events script - this file inclusion needs to be performed dynamically or else the "tap"
		// binding of the item in profile list won't be applied. This is a linear requirement of the process. By
		// taking this out you risk the profile selection binding no longer functioning.
		$.ajax({ url: 'js/personalization/uiEvents.js', async: false, dataType: "script", cache: true, error: function(xhr, ajaxOptions, thrownError) { console.error("Loading 'uiEvents.js':", thrownError); } });
		// Load translations
		// TODO - use local extension (qnx.locale)...
		$.ajax({ url: 'js/personalization/i18n/en-CA.js', async: false, dataType: "script", cache: true, error: function(xhr, ajaxOptions, thrownError) { console.error("Loading 'i18n/en-CA.js':", thrownError); } });
		// Load main mapping - the application simply won't work without this mapping object
		$.ajax({ url: 'js/personalization/settingsMapping.json', async: false, dataType: "json", success: function(data) { Personalization.setSettingsMapping(data) }, error: function(xhr, ajaxOptions, thrownError) { console.error("Loading 'settingsMapping.json':", thrownError); } });

		Personalization.generateSettingsHashMaps(Personalization.getSettingsMapping()); // Generate the hash maps used by personalization

		Personalization.PPS.Reader.getActiveProfile(onActiveProfileSuccess,onActiveProfileError); // Store current user defined in the user PPS object

	} catch(err) {
		console.error("File: personalization.js, initPersonalization() - ", err);
	} 

}

/**
 * To handle successful switch of active profiles
 * @param profile current profile
 * @example
 *
 * Theme descriptor Object:
 * {
 *     id:"default",
 *     name:"default"
 * }
 * */
function onActiveProfileSuccess(profile) {
	Personalization.setCurrentProfile(profile);
	Personalization.Data.Reader.init(onInitSuccess,onInitError); // Initialize the data reader
}

/**
 * To handle error during switch of active profiles
 * @param error Object contains error code and message
 * @example
 *
 * {
 * 		code: "Error Code"
 *    	msg: "Error Message"
 * }
 * */
function onActiveProfileError(error) {
	console.error(error.code, error.msg);
}

/**
 * To handle successful initialization of data reader
 * @param profiles Array contains list of all profiles
 * @example
 *
 * Theme descriptor Object:
 * {
 *     id:"default",
 *     name:"default"
 * }
 * */
function onInitSuccess(profiles) {
	generateProfileList(profiles, Personalization.getCurrentProfile()); // Generate the profile list UI elements
	Personalization.PPS.Reader.getThemesList(onThemeListSuccess, onThemeListError); // Generate the list of available theme options
}

/**
 * To handle error during initialization of data reader
 * @param error Array contains collection of theme descriptors
 * @example
 *
 * {
 * 		code: "Error Code"
 *    	msg: "Error Message"
 * }
 * */
function onInitError(error) {
	console.error(error.code, error.msg);
}

/**
 * Callback will be executed when list of themes available
 * @param themes Array contains collection of theme descriptors
 * */
function onThemeListSuccess(themes) {
	generateThemeList(themes); // Generate the list of available theme options

	generatePreferredDeviceList(Personalization.PPS.Reader.getPairedDevices()); // Generate the list of paired devices

	initializeSettingsEventHandling(Personalization.getSettingsMapping()); // Dynamically create all the necessary PPS listeners defined in the mapping

	// Activate the appropriate profile defined in the local user object
	loadProfileFromList(Personalization.getCurrentProfile().id);

	// Set the first run variable to "false" since this code will never run again
	Personalization.setIsFirstRun(false);

}

/**
 * Callback will be executed when list of themes not available or error happened during execution of the call
 * @param error Object contains error code and message
 * @example
 *
 * {
 * 		code: "Error Code"
 *    	msg: "Error Message"
 * }
 * */
function onThemeListError(error) {
	console.error(error.code, error.msg);
}