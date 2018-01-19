/**
 * Manages the system user information
 *
 * @author mlapierre
 * $Id: index.js 4287 2012-09-26 13:28:57Z edagenais@lixar.com $
 */

var _wwfix = require("../../lib/wwfix"),
	_event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
	_actionMap = {
		/**
		 * @event
		 * Triggered when one of the user elements is updated
		 */
		userupdate: {
			context: require("./context"),
			event: "userupdate",
			trigger: function (args) {
				_event.trigger("userupdate", args);
			}
		},
	},
	_user = require("./user");

/**
 * Initializes the extension 
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
		_user.init();
	} catch (ex) {
		console.error('Error in webworks ext: user/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Returns the current profile information
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getActive: function(success, fail, args, env) {
		try {
			success(_user.getActive());
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Sets the current profile information
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 * @param env {Object} Environment variables
	 *	{
	 *		id: {String},
	 *		fullName: {String},
	 * 		avatar: {String},
	 *	}
	 * @param env {Object} Environment variables
	 */
	setActive: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_user.setActive(args);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Get the navigation history for a given user
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getNavigationHistory: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			var history = _user.getNavigationHistory(args.user);
			success(history);
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Clears the navigation history for a given user
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	clearNavigationHistory: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_user.clearNavigationHistory(args.user);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Adds a location to the navigation history for a given user
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	addToNavigationHistory: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_user.addToNavigationHistory(args.location, args.user);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Get the navigation favourites for a given user
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getNavigationFavourites: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			var favourites = _user.getNavigationFavourites(args.user);
			success(favourites);
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Adds a navigation location to the user's favourites
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	addNavigationFavourite: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_user.addNavigationFavourite(args.location, args.user);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Removes a navigation location to the user's favourites
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	removeNavigationFavourite: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_user.removeNavigationFavourite(args.location);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Gets a list of profiles
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getAllProfiles: function(success, fail, args, env) {
		try {
			var profiles = _user.getAllProfiles();
			success(profiles);
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Gets the details of a given profile
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getProfileDetails: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			var profileDetails = _user.getProfileDetails(args.profileId);
			success(profileDetails);
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Adds a profile
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	addProfile: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			var profileId = _user.addProfile(args);
			success(profileId);
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Updates a given profile
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	updateProfile: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_user.updateProfile(args.profileId, args.attributes);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Delete a given profile
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	deleteProfile: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_user.deleteProfile(args.profileId);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Sets any profile preferred device to "0" where the device matched the unpaired device MAC provided
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	resetProfilePreferredDevice: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_user.resetProfilePreferredDevice(args.deviceId);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Gets all the settings save for a given profile
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		settings: {Array}, //a list of settings to get [optional]
	 *		profileId: {Number}, //profileId The ID of the profile to get the settings for [optional]
	 *	}
	 * @param env {Object} Environment variables
	 */
	getSettings: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			var settings = _user.getSettings(args.settings, args.profileId);
			success(settings);
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Sets a profile preference setting(s)
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 *	{
	 *		settings: {Object}, //an object of settings to set
	 *		profileId: {Number}, //profileId The ID of the profile to get the settings for [optional]
	 *	}
	 * @param env {Object} Environment variables
	 */
	setSettings: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_user.setSettings(args.settings, args.profileId);
			success();
		} catch (e) {
			fail(-1, e);
		}
	}
};