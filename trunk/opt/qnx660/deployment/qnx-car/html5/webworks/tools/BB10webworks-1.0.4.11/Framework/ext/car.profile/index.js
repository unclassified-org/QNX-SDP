/**
 * Manages the system user information
 *
 * @author mlapierre
 * $Id: index.js 4287 2012-09-26 13:28:57Z edagenais@lixar.com $
 */

var _wwfix = require("../../lib/wwfix"),
	_event = require("../../lib/event"),
	_utils = require("./../../lib/utils"),
	_profile = require("./profile"),
	_actionMap = {},
	Event = require("./enum/Event");

// Fill out the action map
_actionMap[Event.UPDATE] = {
	context: require("./context"),
	event: Event.UPDATE,
	trigger: function (args) {
		_event.trigger(Event.UPDATE, args);
	}
};

/**
 * Initializes the extension 
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
		_profile.init();
	} catch (ex) {
		console.error('Error in webworks ext: profile/index.js:init():', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Retrieves the current profile information
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	getActive: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			var result = _profile.getActive();
			success(result);
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Change the active profile
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	setActive: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_profile.setActive(args.profileId);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Return a list of available profiles
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	getList: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			var result = _profile.getList();
			success(result);
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
			var result = _profile.addProfile(args.name, args.avatar, args.theme, args.bluetoothDeviceId);
			success(result);
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
			_profile.updateProfile(args.profileId, args.name, args.avatar, args.theme, args.bluetoothDeviceId);
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
			_profile.deleteProfile(args.profileId);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},


	/**
	 * Gets all the settings save for a given profile
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	getSettings: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			var settings = (args.settings) ? args.settings.split(',') : null;
			var result = _profile.getSettings(_profile.getActive().id, settings);
			success(result);
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Sets a profile preference setting
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	setSetting: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_profile.setSetting(_profile.getActive().id, args.key, args.value);
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
			var history = _profile.getNavigationHistory(_profile.getActive().id);
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
			_profile.clearNavigationHistory(_profile.getActive().id);
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
			_profile.addToNavigationHistory(_profile.getActive().id, args);
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
			var result = _profile.getNavigationFavourites(_profile.getActive().id);
			success(result);
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
			_profile.addNavigationFavourite(_profile.getActive().id, args);
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
			_profile.removeNavigationFavourite(args.favouriteId);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},	
};