// $Id: uiEvents.js 7559 2013-11-15 19:35:58Z mlapierre@qnx.com $
// Bind a "tap" event handler to all list item of the profile list
$("#personalization .containerProfileSelector .profileList").delegate("li", "tap", function(e) {
	// Don't run the following code if the profile "tapped" by the user is already the selected on
	if(!$(this).hasClass("selected")) {
		var self = this;
		var setLastProfileSelectedIndex = true; // Controller to define whether to update the last profile item index or not

		// If this is the first run of personalization OR a new profile entry, do not prompt the user to switch profiles
		// since the switch is being performed programmatically
		if(Personalization.isFirstRun() || Personalization.isNewProfile() || Personalization.profileWasDeleted()) {
			// Run the profile switching process without prompt
			selectProfile(self);
		// If the last profile that was selected was a new, unsaved profile
		} else if($("#personalization .profileList li:eq(" + Personalization.getLastProfileSelectedIndex() + ")").data("profile-id") == -1) { 
			// Confirm that the user want to switch profiles and that is yes, and the details have not been saved, all
			// data for that new profile will be lost
			dialog({
				title: "Personalization",
				body: getTranslation("dialogs.msg1"),
				buttons: [
					{
						text: "Yes",
						tap: function() {
							removeProfileListItem($("#personalization .profileList li:last"));
						}
					},
					{
						text: "No"
					}
				]
			});

			// Maintain value of the last selected profile list item index
			setLastProfileSelectedIndex = false;
		} else {
			var dialogMessage = getTranslation("dialogs.msg3");

			// Confirm that the user really wants to switch profiles (ie. accidentally tap another profile by mistake
			dialog({
				title: "Personalization",
				body: dialogMessage,
				buttons: [
					{
						text: "Yes",
						tap: function() { selectProfile(self); }
					},
					{
						text: "No"
					}
				]
			});
		}

		// If an update on the last selected profile list item index is permitted
		if(setLastProfileSelectedIndex) {
			Personalization.setLastProfileSelectedIndex($(this).index());
		}
	}
});

// Bind event handler to the "add profile" button
$("#personalization .containerProfileSelector .ctrlAddProfile").tap(function() {
	addProfile();
});

// Bind event handler to the "remove profile" button
$("#personalization .containerProfileSelector .ctrlRemoveProfile").tap(function() {
	removeProfile();
});

// Bind an event handler for touchdown/mousedown on the profile list wrapper
$("#personalization .containerProfileSelector .profileListWrapper").bind("vmousedown", function(e) {
	var startClientY = e.clientY; // The inital y-axis position of the pointer on a touchdown/mousedown

	// Bind an event handler for touchmove/mousemove ONLY when the touchdown/mousedown event has been triggered
	$(this).bind("vmousemove", function(e) {
		Personalization.setClientDeltaY(e.clientY - startClientY); // Calculate the y-axis mouse delta from when the user first touched down to now
		Personalization.setElementY(Personalization.getStartElementY() + Personalization.getClientDeltaY()); // Calculate the y-axis position of the where the profile list needs to be from where it was

		// If the positioning of the profile list is about to sit beyond the allowable range, set it to the max range value.
		// This will prevent the list from being dragged up beyond the last element of the list.
		if(Personalization.getElementY() < 0 && Personalization.getElementY() < Personalization.getRangeMaxY()) {
			Personalization.setElementY(Personalization.getRangeMaxY());
		}

		// If the positioning of the profile list is about to sit beyond the allowable range, set it to 0.
		// This will prevent the list from being dragged down beyond the first element of the list.
		if(Personalization.getListHeight() < Personalization.getWrapperHeight() || Personalization.getElementY() > 0) {
			Personalization.setElementY(0);
		}

		// Perform the repositioning of the profile list element using 3d acceleration
		$(".profileList", $(this)).css("-webkit-transform", "translate3d(0px, " + Personalization.getElementY() + "px, 0px)");
	});
});

// Bind an event handler for touchup/mouseup on the profile list wrapper
$("#personalization .containerProfileSelector .profileListWrapper").bind("vmouseup", function(e) {
	// Kill the touchmove/mousemove event bind to prevent unnecessary DOM tracking - will help with performance
	$(this).unbind("vmousemove");
	// Store the new y-axis position of the profile list element
	Personalization.setStartElementY(Personalization.getElementY());
});

$("#personalization .containerProfileSettings form").submit(function(e) {
	saveProfile();
	return false;
});

$(":input, :radio, :checkbox", "#personalization .containerProfileSettings form").change(function() {
	// Auto save the profile any time a control on the form is modified
	if(!Personalization.isFirstRun() && !Personalization.isSelectingProfile()) {
		saveProfile();
	}
});

// Bind event handler to the button button that completely clear the profile "name" field
$("#personalization .ctrlClearField").tap(function() {
	// this is workaround for issue with jQMobile,
	// this code adds this function to rendering ques, otherwise it will be omitted
	setTimeout(function(){
		$("#personalization .txtName").val("");
		$("#personalization .txtName").focus();
		// register blur handle for only one event handling
		$("#personalization .txtName").one('blur',function() {
			// Auto save the profile any time a control on the form is modified
			if(!Personalization.isFirstRun()) {
				saveProfile();
			}
		});
	},0);
});

// Bind event handler to the "Active Theme" dropdown
$("#personalization #personalizationCtrlTheme").tap(function() {
	showModalBlade($(this));
});

// Bind event handler to the "Avatar" dropdown
$("#personalization #personalizationCtrlAvatar").tap(function() {
	showModalBlade($(this));
});

// Bind event handler to the "Preferred Device" dropdown
$("#personalization #personalizationCtrlPreferredDevice").tap(function() {
	showModalBlade($(this));
});

// Bind event handler to the "set up phone pairing" button
$("#personalization .ctrlPhonePairing").tap(function() {
	Personalization.PPS.Writer.launchApp("Settings");
});

/**
 * Perform all the necessary processes required when selecting a profile from the profile list
 * 
 * @param profileItem {Object} the DOM object represent the item selected in the profile list
 */
function selectProfile(profileItem) {
	try {
		loadingOverlay({text: "Loading profile"});

		Personalization.setIsSelectingProfile(true);

		// If the first item in the list is selected, disable the "remove" button for the profile controls.
		// The first item is the master profile and should never be removed.
		if($(profileItem).index() == 0) {
			$("#personalization .containerProfileSelector .ctrlRemoveProfile").addClass("disabled").prop("disabled", true);
		} else {
			$("#personalization .containerProfileSelector .ctrlRemoveProfile").removeClass("disabled").prop("disabled", false);
		}

		// When a profile element is selected from the profile list, remove all instances of the "selected" class
		// and add the "selected" class to the last element clicked.
		$(profileItem).parent().find("li").removeClass("selected");

		// Add a class to will highlight the selected item
		$(profileItem).addClass("selected");

		displayProfileListItem();

		// Set the form data from the database according to the profile selected by the user
		Personalization.Data.Reader.getUserData($(profileItem).data("profile-id"),
			function(profile){
				updateUIFromDb(profile);

				car.profile.setActive(profile.id);

				// Ensure the common flag for "new profile" is set to false to re-enable critical prompts
				Personalization.setIsNewProfile(false);
				Personalization.setProfileWasDeleted(false);
				Personalization.setIsSelectingProfile(false);
			},
			function(error) {
				console.error(error.code, error.msg);
			});
	} catch(err) {
		console.error("File: uiEvents.js, selectProfile() - ", err);
	}finally {
		loadingOverlay({action: "hide"});
	}
}

/**
 * Performs all processes for adding a new profile to the system (UI, PPS, DB)
 */
function addProfile() {
	try {
		loadingOverlay({text: "Creating new profile"});

		// Set the common variable for adding a new user to "true" to avoid unnecessary dialog prompts
		Personalization.setIsNewProfile(true);

		addProfileListItem({
			id: -1,
			avatar: "",
			name: "User"
		});

		$("#personalization .profileList li:last").tap();

		createProfile();

		var settings = Personalization.getSettingsMappingDBHash();
		var dbSettingsCollection = {};

		// Save all current PPS settings defined in the master mapping. Loop through each field of the settings mappings and store 
		// the key/value pair in the database
		for(var settingKey in settings) {
			var field = settings[settingKey];
			var getter = eval(field.getterMethod); // Getter method of the field mapping

			getter(successCallback.bind(field), errorCallback);

			function successCallback(fields) {
				var _field = this;

				var fieldValue; // PPS value returned by the getter method
				// If the getter requires the attribute as a parameter, provide it
				if(_field.getSetWithAttribute && _field.getSetWithAttribute == "true") {
					// loop through the array result
					for (var i=0; i<fields.length; i++) {
						// all new pps fields defines as settings_zone
						var t = _field.ppsField.split("_");
						var ppsField = t[0];
						var zone = t[1];
						if(fields[i].setting == ppsField && fields[i].zone == zone) {
							fieldValue = fields[i].value;
							break;
						}
					}
				}

				// If the value being used is of type "json", stringify it to not lose any formatting
				if(_field.dataType === "json") {
					fieldValue = JSON.stringify(fieldValue);
				}

				// save the data to the db
				Personalization.Data.Writer.setSettings(_field.dbField, fieldValue);
			}

			function errorCallback(error) {
				console.error(error.code, error.msg);
			}
		}
	} catch(err) {
		console.error("File: uiEvents.js, addProfile() - ", err);
	} finally {
		loadingOverlay({action: "hide"});
	}
}

/**
 * Brings the selected profile into view if it happens to be outside the viewable boundaries of its parent container
 */
function displayProfileListItem() {
	try {
		var profileItem = $("#personalization .containerProfileSelector .profileList li.selected"); // Selected profile
	
		// Make sure the that UI has loaded and all dimensions have been calculated by the DOM
		if(Personalization.getWrapperHeight() !== 0 && profileItem.length > 0) {
			var profileItemY = $(profileItem).position().top;
			var profileItemHeight = $(profileItem).outerHeight();
			var profileItemBottomY = profileItemY + profileItemHeight;
	
			// If the item selected is not being fully displayed on the top of the list, scroll the list down to fully display the list item
			if(profileItemBottomY > ((Personalization.getStartElementY() * -1) + Personalization.getWrapperHeight())) {
				Personalization.setElementY((profileItemBottomY - Personalization.getWrapperHeight()) * -1);
			// If the item selected is not being fully displayed on the bottom of the list, scroll the list up to fully display the list item
			} else if(profileItemY + Personalization.getStartElementY() <= 0) {
				Personalization.setElementY(Personalization.getStartElementY() - (profileItemY + Personalization.getStartElementY()));
			}
			// Set the starting position of the list in the global configuration object for future processes
			Personalization.setStartElementY(Personalization.getElementY());
	
			// Perform a transition to move the list to the appropriate Y position
			$(profileItem).parent().css("-webkit-transform", "translate3d(0px, " + Personalization.getElementY() + "px, 0px)");
		}
	} catch(err) {
		console.error("File: uiEvents.js, displayProfileListItem() - ", err);
	}
}

/**
 * Locally stores the dimensions of the profile list to support the list scrolling functionality
 */
function setProfileListDimensions() {
	Personalization.setWrapperHeight($("#personalization .containerProfileSelector .profileListWrapper").outerHeight()); // Get the height of the parent of the profile list
	Personalization.setListHeight($("#personalization .containerProfileSelector .profileListWrapper .profileList").outerHeight()); // Get the full height of the profile list
	Personalization.setRangeMaxY((Personalization.getListHeight() - Personalization.getWrapperHeight()) * -1); // Determine the max range allowed for a user to drag the profile list
}

/**
 * Generate the profile list items
 * 
 * @param profiles {Object} list of profile objects
 * @param currentProfile {Object} current profile
 */
function generateProfileList(profiles, currentProfile) {
	// For each profile in the database
	$.each(profiles, function(profileIndex, profile) {
		// Add a new selection item in the profile list
		addProfileListItem(profile);
	});
}

/**
 * Create a string compilation of the user data to be rendered to display
 * 
 * @param profile {Object} profile object containing:
 * 			{
 * 				id:			#,
 * 				full_name:	"",
 * 				avatar:		"",
 * 			}
 */
function addProfileListItem(profile) {
	var profileItemString = '<li class="' + profile.avatar + '" data-profile-id="' + profile.id + '" data-avatar="' + profile.avatar + '"><span class="name">' + profile.name + '</span></li>';

	// Populate the list of users available
	$("#personalization .profileList").append(profileItemString);

	// If the application has not yet displayed, ignore this code as it will be performed on all the initially loaded profiles
	// rather than doing it one profile at a time
	if(!Personalization.isFirstRun()) {
		// Store the new dimensions of the profile list
		setProfileListDimensions();
	}
}

/**
 * Remove a profile item from the profile list AND the data-source - essentially, delete 
 * the profile from the system
 * 
 * @param selectedProfile {Object} the DOM object of the selected list item
 */
function removeProfileListItem(selectedProfile) {
	var userId = selectedProfile.data("profile-id"); // The id of the selected user profile

	// Remove the profile from the list
	selectedProfile.remove();

	// Store the new dimensions of the profile list
	setProfileListDimensions();

	// Only perform this step if the list item being removed is not a new profile (new profiles are identified by a profile
	// id of "-1"
	if(userId !== -1) {
		// Delete the profile from the database
		Personalization.Data.Writer.deleteProfile(userId);
	}

	Personalization.setProfileWasDeleted(true);

	// Automatically select the first user profile in the list to activate some settings
	loadProfileFromList(1);
}

/**
 * Updates HMI from and stores settings values in PPS
 * when profile switches or new created
 * @param activeProfile {Object} containing current profile, comes from DB
 		{
 		 	id: 2,
			name: "User",
			theme: "default",
			avatar: "male1",
			bluetoothDeviceId: 0
		}
 * */
function updateUIFromDb(activeProfile) {

	try {
		/*****************************************************************************
		 * BEGIN - Database to UI
		 ****************************************************************************/

		// If profile is undefined, then this signifies a new profile entry. Create a generic/default profile for the user
		// to start from
		if(parseInt($("#personalization .profileList li:last").data("profile-id")) == -1) {
			activeProfile = {
				id: -1,
				name: "User",
				theme: "default",
				avatar: "male1",
				bluetoothDeviceId: 0
			}
		} else if(typeof activeProfile == "undefined") {
			throw "0";
		}

		// Force the PPS object to get refreshed to update the theme and various data on other tabs (ie. Status)
		// in same time set the active user

		var currentProfile = Personalization.getCurrentProfile();

		if (currentProfile.id != activeProfile.id ||
			currentProfile.name != activeProfile.name ||
			currentProfile.avatar != activeProfile.avatar ||
			currentProfile.theme != activeProfile.theme ||
			currentProfile.deviceId != activeProfile.deviceId
		) {
			Personalization.PPS.Writer.updateProfile({
				id: activeProfile.id,
				name: activeProfile.name,
				avatar: activeProfile.avatar,
				theme: activeProfile.theme,
				deviceId: activeProfile.deviceId
			});
		}

		// Set the value for the name field of the user
		$("#personalization #personalizationCtrlName").val(activeProfile.name);
		// Set the value for the theme field of the user
		$("#personalization #personalizationCtrlTheme").val(activeProfile.theme).trigger("change");
		// Set the value of the avatar field of the user
		$("#personalization #personalizationCtrlAvatar").val(activeProfile.avatar).trigger("change");
		// Set the value of the Preferred Device field of the user
		$("#personalization #personalizationCtrlPreferredDevice").val(activeProfile.bluetoothDeviceId).trigger("change");

		/*****************************************************************************
		 * END - Database to UI
		 ****************************************************************************/


		// Set the locally accessible profile for speedy memory retrieval - we want to avoid hitting
		// the PPS every time we need information about the current profile
		Personalization.setCurrentProfile({
			id: activeProfile.id,
			name: activeProfile.name,
			avatar: activeProfile.avatar,
			theme: activeProfile.theme,
			deviceId: activeProfile.bluetoothDeviceId
		});

		// If a preferred device has been specified and is different than the current one selected
		if(currentProfile.bluetoothDeviceId !== activeProfile.bluetoothDeviceId && activeProfile.bluetoothDeviceId != "0") {
			// Send command to connect the users preferred device
			Personalization.PPS.Writer.connectPreferredDevice(activeProfile.bluetoothDeviceId);
		}

	} catch(err) {
		console.error("File: uiEvents.js, updateUIFromDb() - ", err);
	} finally {
		// Timeout to ensure that the process never hangs or never completes and permanently locks the UI. If
		// after 30 seconds there are still events in the stack: purge the stack, process any post events and
		// unlock the UI.
		if(Object.keys(Personalization.getEventStack()).length > 0) {
			setTimeout(function() {
				// If there are post events to process
				if(Object.keys(Personalization.getPostEventStack()).length > 0) {
					// Clear the event stack to unlock the PPS listeners
					Personalization.clearEventStack();
					// Process all post events that may have collected during primary event stack processing
					processPostEventStack();
					// Unblock the UI
					loadingOverlay({action:"hide"});
				}
			}, 30000);
		} else {
			loadingOverlay({action:"hide"});
		}
	}
}

/**
 * Updates UI control for theme, used to update theme when it is changed in PPS
 * @param profile {Object} containing current profile
 {
	id: 2,
	name: "User",
	theme: "default",
	avatar: "male1",
	bluetoothDeviceId: 0
}
 * */
function updateThemeUI(profile) {
	var activeThemeCtrl = $("#personalization #personalizationCtrlTheme");
	if(typeof activeThemeCtrl !== "undefined") {
		activeThemeCtrl.val(profile.theme).trigger("change");
	}
}

/**
 * Update PPS with the values in the personalization database
 * */
function updatePPSfromDB() {
	Personalization.Data.Reader.getSettings(
		function (settings) {
			populateEventStack(settings);

			if(settings.length > 0) {
				// Force the PPS object to get refreshed to update the various audio/hvac UI components
				Personalization.PPS.Writer.updateSettings(settings);
			}
		},
		function (error) {
			console.error(error.code, error.msg);
	});
}

/**
 * Stores profile values in PPS when profile changed
 * @param newProfile {Object} containing profile info gathered from HMI
 {
 	id: "2",
	name: "User",
	theme: "default",
	avatar: "male1",
	bluetoothDeviceId: 0
}
 * */
function updateProfile(newProfile) {

	var currentProfile = Personalization.getCurrentProfile();

	try {
		// Update the respective PPS objects
		Personalization.PPS.Writer.updateProfile(newProfile);

		var selectedProfileItem = $("#personalization .containerProfileSelector .profileList li.selected");

		// Swap out the avatar image if the value was changed
		if(newProfile.avatar !== currentProfile.avatar) {
			selectedProfileItem.attr("class", "selected " + newProfile.avatar);
		}

		// Swap out the user name if the value was changed
		if(currentProfile.name !== newProfile.name) {
			$("span.name", selectedProfileItem).text(newProfile.name);
		}

		// Connect to new device selected by the user
		if(currentProfile.deviceId !== newProfile.deviceId && newProfile.deviceId != 0 && newProfile.deviceId != undefined) {
			Personalization.PPS.Writer.connectPreferredDevice(newProfile.deviceId); // Connect new device
		}

		// Update the local profile object
		Personalization.setCurrentProfile(newProfile);
	} catch(err) {
		console.error("File: uiEvents.js, updateProfile() - ", err);
	}
}

/**
 * Function creates new default profile
 * Sets it as selected and adds to database
 * */
function createProfile() {
	var newProfile = {
		id: -1,
		name: "User",
		theme: "default",
		avatar: "male1",
		bluetoothDeviceId: 0
	};

	// Save changes to the datastore
	Personalization.Data.Writer.addProfileDetails(newProfile, addProfileDetailsSuccess,addProfileDetailsError);

	/**
	 * Callback return profile ID of newly added profile
	 * @param profileId String new profile id
	 * */
	function addProfileDetailsSuccess(profileId) {
		// Update the locally scoped profile object to provide the correct value to the PPS update
		newProfile.id = profileId;
		// Update the UI metadata
		var selectedProfileItem = $("#personalization .containerProfileSelector .profileList li.selected");
		if(typeof selectedProfileItem !== "undefined") {
			selectedProfileItem.attr("data-profile-id", profileId);
			selectedProfileItem.data("profile-id", profileId);
		}
		updateProfile(newProfile);
		selectProfile(selectedProfileItem);
	}

	/**
	 * To handle error during switch of active profiles
	 * @param error Object contains error code and message
	 * @example
	 *
	 * {
	 * 		code: "Error Code"
	 * 		msg: "Error Message"
	 * }
	 * */
	function addProfileDetailsError(error) {
		console.error(error.code, error.msg);
	}
}

/**
 * Saves the current profile information in database
 */
function saveProfile() {
	try {
		var profileId = $("#personalization .profileList .selected").data("profile-id");

		//check if profile name is not empty, if yes - return original name
		var nameNew = $("#personalization #personalizationCtrlName").val();

		if(nameNew.length == 0) {
			// get the old name
			var currentProfile = Personalization.getCurrentProfile();
			nameNew = currentProfile.name;
			// reset the name on HMI
			$("#personalization #personalizationCtrlName").val(nameNew);
		}

		var newProfile = {
			id: profileId,
			name: nameNew,
			theme: $("#personalization #personalizationCtrlTheme").val(),
			avatar: $("#personalization #personalizationCtrlAvatar").val(),
			deviceId: $("#personalization #personalizationCtrlPreferredDevice").val()
		};

		var selectedProfileItem = $("#personalization .containerProfileSelector .profileList li.selected");

		// Save if this is valid and not new profile
		if(profileId != -1) {
			Personalization.Data.Writer.saveProfileDetails(newProfile);
			updateProfile(newProfile);
		}

	} catch(err) {
		console.error("File: uiEvents.js, saveProfile() - ", err);
	}
}

/**
 * Function generates a list of themes available for the user to select
 */
function generateThemeList(themeList) {
	var themeListString = "";

	if(Object.keys(themeList).length === 0) {
		themeListString += '<option value="default">Default</option>';
	} else {
		// Create a string compilation of the theme data to be rendered to display
		for(themeKey in themeList) {
			themeListString += '<option value="' + themeList[themeKey].id + '">' + themeList[themeKey].name + '</option>';
		}
	}

	// Populate the list of themes available into the theme dropdown
	$("#personalization #personalizationCtrlTheme").append(themeListString);
}

/**
 * Function generates a list of paired bluetooth devices
 */
function generatePreferredDeviceList(pairedList) {
	var pairedListString = "";
	var preferredDeviceCtrl = $("#personalization #personalizationCtrlPreferredDevice");
	var currentProfile = Personalization.getCurrentProfile();

	// Clear the existing list of preferred devices
	$("option:gt(0)", preferredDeviceCtrl).remove();

	// Loop through the devices returned by the PPS object
	for(deviceKey in pairedList) {
		// escaping HTML entities
		var escapedName = htmlEscape(pairedList[deviceKey].name);
		pairedListString += '<option value="' + deviceKey + '">' + escapedName + '</option>';
	}

	// Populate the list of paired devices into the theme preferred devices dropdown
	preferredDeviceCtrl.append(pairedListString);

	// select the preferred device, if possible
	if(typeof pairedList[currentProfile.deviceId] !== "undefined") {
		preferredDeviceCtrl.val(currentProfile.deviceId); // Update the value of the dropdown ctrl
		// Update the text of the dropdown ctrl UI sibling element - triggering the "change" event on this element as done in
		// other areas would force a database call to update the profile.
		console.log("generatePreferredDeviceList setting text to " + pairedList[currentProfile.deviceId].name);
		preferredDeviceCtrl.prev().find(".ctrlLabel").text(pairedList[currentProfile.deviceId].name); 
	} else {
		// find the - NONE - option
		var select = [$('option', "#personalization #personalizationCtrlPreferredDevice")];
		if(typeof select !== "undefined" && typeof select[0] !== "undefined" && typeof select[0][0] !== "undefined") {
			var noneDevice = select[0][0]; // pick first device in the select list, hardcoded always there
			// clean selection up if device selected was actually unpaired
			preferredDeviceCtrl.val(noneDevice.value); // Update the value of the dropdown ctrl
			preferredDeviceCtrl.prev().find(".ctrlLabel").text(noneDevice.text); // Update the value of the container displaying selected value
		}
	}
}

/**
 * Loads a specific profile from the database selected via the profile list on the personalization UI
 * 
 * @param profileId {Number} Id of the profile to load
 */
function loadProfileFromList(profileId) {
	$("#personalization .profileList li[data-profile-id=" + profileId + "]").trigger("tap");
}

/**
 * Performs all processes for completely removing a profile from the system (UI, PPS, DB)
 */
function removeProfile() {
	try {
		loadingOverlay({text: "Removing profile"});

		var selectedProfile = $("#personalization .containerProfileSelector .profileList li.selected");

		// Run only if the "Remove Profile" button is enabled
		if(selectedProfile.data("profile-id") != 1) {
			dialog({
				title: "Personalization",
				body: "Are you sure you wish to completely remove this profile? This action cannot be undone.",
				buttons: [
					{
						text: "Yes",
						tap: function() {
							removeProfileListItem(selectedProfile);
						}
					},
					{
						text: "No"
					}
				]
			});
		}
	} catch(err) {
		console.error("File: uiEvents.js, removeProfile() - ", err);
	} finally {
		loadingOverlay({action: "hide"});
	}
}