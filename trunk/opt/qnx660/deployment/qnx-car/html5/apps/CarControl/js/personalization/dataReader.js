// $Id: dataReader.js 6420 2013-05-31 13:36:57Z mlytvynyuk@qnx.com $
Personalization.ns("Personalization.Data");

Personalization.Data.Reader = new function() {

	var self = this;

	///// PUBLIC METHODS /////

	var currentProfiles = {};

	/**
	 * Initialises data reader.
	 *
	 * @param successCallback {Function} callback when user data is available
	 * @param errorCallback {Function} callback when there is an error
	 */
	self.init = function(successCallback, errorCallback) {
		car.profile.getList(function(profiles){
			currentProfiles = profiles; // save profiles locally
			successCallback(profiles); // invoke external callback indicating that init done
		},errorCallback);
	}

	/**
	 * Populate all the fields of the personalization UI with that found in the data store
	 * 
	 * @param profileId {String} - Id for a given user
	 * @param successCallback {Function} callback when user data is available
	 * @param errorCallback {Function} callback when there is an error
	 */
	self.getUserData = function(profileId, successCallback, errorCallback) {
		car.profile.getList(function(profiles){
			currentProfiles = profiles; // save profiles locally

			var profile;

			$.each(profiles, function(index, value) {
				if(value.id == profileId) {
					profile = value;
					return;
				}
			});

			successCallback(profile); // invoke external callback indicating that init done
		},errorCallback);
	}

	/**
	 * Returns all settings from the database for a particular profile
	 *
	 * @param successCallback {Function} callback when user data is available
	 * @param errorCallback {Function} callback when there is an error
	 */
	self.getSettings = function(successCallback, errorCallback) {
		return car.profile.getSettings(successCallback, errorCallback);
	}
}