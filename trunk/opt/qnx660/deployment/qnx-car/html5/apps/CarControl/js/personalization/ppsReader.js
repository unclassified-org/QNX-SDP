// $Id: ppsReader.js 6420 2013-05-31 13:36:57Z mlytvynyuk@qnx.com $
Personalization.ns("Personalization.PPS");

Personalization.PPS.Reader = new function () {

	var self = this;

	/**
	 * Request active profiles data
	 * @param successCallback {Function} invoked when data is available
	 * @param errorCallback {Function} invoked when there is an error
	 * */
	self.getActiveProfile = function(successCallback, errorCallback) {
		car.profile.getActive(successCallback, errorCallback);
	}

	/**
	 * Request list of themes
	 * @param successCallback {Function} invoked when data is available
	 * @param errorCallback {Function} invoked when there is an error
	 * */
	self.getThemesList = function(successCallback, errorCallback) {
		car.theme.getList(successCallback, errorCallback);
	}

	/**
	 * Request list of paired bluetooth devices
	 * */
	self.getPairedDevices = function() {
		return qnx.bluetooth.getPaired();
	}
}