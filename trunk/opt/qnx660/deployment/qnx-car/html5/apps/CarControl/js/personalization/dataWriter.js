// $Id: dataWriter.js 6603 2013-06-18 19:14:58Z mlytvynyuk@qnx.com $
Personalization.ns("Personalization.Data");

Personalization.Data.Writer = new function () {

	var self = this;

	/**
	 * Add a new profile to the data store
	 * 
	 * @param profileDetails {Object} details of a given profile (full name, avatar, theme and preferred device)
	 * 
	 * @returns {Number} the ID of the last profile created
	 */
	self.addProfile = function(profileDetails, successCallback, errorCallback) {
		car.profile.addProfile(
			profileDetails.name,
			profileDetails.avatar,
			profileDetails.theme,
			profileDetails.deviceId,
			successCallback,
			errorCallback
		);
	}

	/**
	 * Adds new profiles details, and returns newly added profile data
	 * @param profileDetails {Object} profile details to add
	 * @param successCallback {Function} invoked when data is available
	 * @param errorCallback {Function} invoked when there is an error
	 */
	self.addProfileDetails = function(profileDetails,successCallback, errorCallback) {
		self.addProfile(profileDetails,successCallback, errorCallback);
		// Ensure the common flag for "new profile" is set to false to re-enable critical prompts
		Personalization.setIsNewProfile(false);
	}

	/**
	 * Update a profiles details
	 * @param profileDetails {Object} profile details to save
	 * @returns {Number} the ID of the profile either just added or updated
	 */
	self.saveProfileDetails = function(profileDetails) {
		var profileId = null;

		self.updateProfileAttributes({
			name: profileDetails.name,
			theme: profileDetails.theme,
			avatar: profileDetails.avatar,
			device_id: profileDetails.deviceId
		});

		// Set the local profile ID variable to
		profileId = profileDetails.id;

		// Ensure the common flag for "new profile" is set to false to re-enable critical prompts
		Personalization.setIsNewProfile(false);

		// Bubble the profile ID back up
		return profileId;
	}
	
	self.updateProfileAttributes = function(attributes) {
		car.profile.updateProfile(Personalization.getCurrentProfile().id, attributes.name,attributes.avatar,attributes.theme,attributes.device_id);
	}

	/**
	 * Delete a profile
	 */
	self.deleteProfile = function(profileId) {
		car.profile.deleteProfile(profileId);
	}

	/**
	 * Reset the device ids for all profiles that have the unpaired device as their
	 * preferred device
	 */
	self.resetProfilePreferredDevice = function(deviceId) {
		car.profile.getList(function(profiles){
				for (var i=0; i<profiles.length; i++) {
					if(profiles[i].bluetoothDeviceId == deviceId) {
						profiles[i].bluetoothDeviceId = 0;
						car.profile.updateProfile(profiles[i].id, profiles[i].name, profiles[i].avatar, profiles[i].theme, profiles[i].bluetoothDeviceId);
					}
				}
		},
		function(error) {
			console.error(error.code, error.msg);
		});
	}

	/**
	 * Save a setting to the database
	 */
	self.setSettings = function(key, value) {
		car.profile.setSetting(key, value);
	}
}