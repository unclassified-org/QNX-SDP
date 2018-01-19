// $Id: ppsWriter.js 7349 2013-10-15 19:57:32Z mlapierre@qnx.com $
Personalization.ns("Personalization.PPS");

Personalization.PPS.Writer = new function () {

	var self = this;

	/**
	 * Update all PPS objects affected by a profile switch
	 */
	self.updateProfile = function(profileDetails) {
		// Update the theme PPS object
		car.theme.setActive(profileDetails.theme);

		// Update the user PPS object
		car.profile.updateProfile(
			profileDetails.id,
			profileDetails.name,
			profileDetails.avatar,
			profileDetails.theme
		);

		// Set current user active
/*		car.profile.setActive(
			profileDetails.id
		);
*/
	}

	/**
	 * Sets all the necessary PPS objects to the values defined in the users profile database
	 * 
	 * @settings {Array} an array of objects representing a specific setting from the database
	 */
	self.updateSettings = function(settings) {
		try {
			var settingsLen = settings.length;

			// Loop through each setting defined in the settings argument and match it to the mapping object
			for(var settingIndex = 0; settingIndex < settingsLen; settingIndex++) {
				var setting = settings[settingIndex];
				var field = Personalization.getSettingsMappingDBHash()[setting.key];

				// If the setting exist as a field in the mapping
				if(field) {
					var setter = eval(field.setterMethod);
					var fieldValue = typeCast(field.dataType, setting.value);

					// If the setter requires the attribute as a parameter, provide it
					if(typeof field.getSetWithAttribute != "undefined") {
						// Generate the correct structure to send to an extension requiring a key/value object
						var structuredValue = {};
						structuredValue[field.ppsField] = fieldValue;

						// ADAPTATION: split keys to setting and zone
						var t = field.ppsField.split("_");
						var settingName = t[0];
						var zone = t[1];

						// call setter
						setter(settingName,zone,fieldValue);
					} else {
						setter(fieldValue);
					}
				}
			}
		} catch(err) {
			console.error("file:ppsWriter.js, updateSettings()", err);
		}
	}

	self.launchApp = function(app) {
		qnx.application.start(app);
	}

	/**
	 * Function sends a message to bluetooth service to connect to device specified
	 */
	self.connectPreferredDevice = function(deviceId) {
		qnx.bluetooth.connectService(qnx.bluetooth.SERVICE_ALL, deviceId);
	}
}