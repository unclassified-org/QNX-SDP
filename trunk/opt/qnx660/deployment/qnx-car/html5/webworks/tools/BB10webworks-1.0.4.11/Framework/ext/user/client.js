/**
 * @module qnx_xyz_user
 * @description Manage the system user information
 * 
 * @deprecated Please use car.profile instead.
 */

/* 
 * @author mlapierre
 * $Id: client.js 4582 2012-10-11 19:59:26Z mlapierre@qnx.com $
 */

var _ID = require("./manifest.json").namespace;

/*
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Return the current user information
	 * @returns {Object} The requested user object
	 * @example
	 *{
	 *     id: {Number},
	 *     fullName: {String},
	 *     avatar: {String},
	 *}
	 */
	getActive: function() {
		return window.webworks.execSync(_ID, 'getActive');
	},
	
	/**
	 * Set the current user information
	 * @param {Object} user The new user object
	 */
	setActive: function(user) {
		window.webworks.execSync(_ID, 'setActive', user);
	},
	
	/**
	 * Return all profiles
	 * 
	 * @return {Array} all profiles
	 */
	getAllProfiles: function() {
		return window.webworks.execSync(_ID, 'getAllProfiles');
	},

	/**
	 * Return a single profile
	 * 
	 * @param {Number} profileId The ID of the profile
	 * @return {Object} A single profile with all the details
	 */
	getProfileDetails: function(profileId) {
		var args = {
			profileId: profileId
		}

		return window.webworks.execSync(_ID, 'getProfileDetails', args);
	},


	/**
	 * Create a new profile
	 * 
	 * @param {Object} args The object defining the details of a profile
	 *@Example:
	 *{
	 *profileId {Number} The ID of the profile
	 *fullName {String} name of user
	 *theme {String} preferred default theme
	 *avatar {Number} preferred avatar
	 *deviceId {Number} preferred Bluetooth device
	 *}
	 * @return {Number} ID of the last row entered in the profiles table
	 */
	addProfile: function(args) {
		return window.webworks.execSync(_ID, 'addProfile', args);
	},

	/**
	 * Update the value of a key/value pair of a profile
	 * 
	 * @param {Number} profileId The ID of the profile
	 * @param {Object} attributes The key/value pair(s)
	 */
	updateProfile: function(profileId, attributes) {
		window.webworks.execSync(_ID, 'updateProfile', { profileId: profileId, attributes: attributes });
	},

	/**
	 * Delete a profile
	 * 
	 * @param {Number} profileId The ID of the profile
	 */
	deleteProfile: function(profileId) {
		window.webworks.execSync(_ID, 'deleteProfile', { profileId: profileId });
	},

	/**
	 * Reset the device IDs for all profiles that have the unpaired device as their
	 * preferred device
	 * 
	 * @param {String} deviceId The MAC address of the Bluetooth device
	 */
	resetProfilePreferredDevice: function(deviceId) {
		window.webworks.execSync(_ID, 'resetProfilePreferredDevice', { deviceId: deviceId });
	},

	/**
	 * Return all settings for a given profile
	 * @param {Array} settings A list of settings to get [optional]; if omitted, all settings are returned
	 * @param {Number} profileId The ID of the profile to get the settings for [optional; default to current user]
	 * @returns {Array} The specified settings for the given profile
	 */
	getSettings: function(settings, profileId) {
		var args = {};

		if (settings != null && typeof settings == 'object') {
		    args["settings"] = settings;
		}
		if (!isNaN(profileId) && profileId > 0) {
			args["profileId"] = profileId;
		}

		return window.webworks.execSync(_ID, 'getSettings', args);
	},

	/**
	 * Set the value of one or more settings for a given profile
	 * @param {Object} settings Data specifying the name of the key, its value, and the profile ID
	 * @param {Number} profileId The ID of the profile to set the settings [optional; defaults to current user]
	 */
	setSettings: function(settings, profileId) {
		var args = {};

		if (settings != null && typeof settings == 'object') {
		    args["settings"] = settings;
		}
		if (!isNaN(profileId) && profileId > 0) {
			args["profileId"] = profileId;
		}

		window.webworks.execSync(_ID, 'setSettings', args);
	}
};