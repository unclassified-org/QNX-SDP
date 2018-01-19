/**
 * Allows control of GPS navigation 
 *
 * @author mlapierre
 * $Id: index.js 4277 2012-09-25 18:23:24Z mlapierre@qnx.com $
 */

var _event = require("../../lib/event"),
	_wwfix = require("../../lib/wwfix"),
	_utils = require("./../../lib/utils"),
	_profile = _utils.loadExtensionModule("car.profile", "index"),
	_actionMap = {},
	_navigation = require('./navigation'),
	_provider = null,
	Event = require('./enum/Event');

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

		//determine the configured navigation provider
		var settingsExt = _utils.loadExtensionModule("settings", "settings");
		var settings = settingsExt.get(['navigationProvider']);

		//check if the navigation provider exists
		if (settings.navigationProvider) {
			try {
				_provider = require('./providers/' + settings.navigationProvider);
			} catch(ex) {
				// If this is an XMLHttpRequestException, then it's likely because the specified provider file simply does not exist
				// So, if this is another type of exception, we'll rethrow since there may be another problem
				if (ex instanceof XMLHttpRequestException === false) {
					throw ex;
				}
			}
		}
		
		//load the navigation provider
		if (_provider) {
			_navigation.setProvider(_provider);
			_provider.init();
		} else {
			console.error('qnx.navigation index.js::init() - Unknown or invalid navigationProvider "' + (settings.navigationProvider || '') + '".');
		}
	} catch (ex) {
		console.error('qnx.navigation index.js::init() - Error occurred during initialization.', ex);
	}
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Gets the current user's favourite locations
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getFavourites: function(success, fail, args, env) {
		_profile.getNavigationFavourites(success, fail, args, env);
	},
	
	/**
	 * Adds a location to the current user's favourite locations
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: 
	 *	{
	 *		location: {Object}, //a location object 
	 *	}
	 * @param env {Object} Environment variables
	 */
	addFavourite: function(success, fail, args, env) {
		_profile.addNavigationFavourite(success, fail, args, env);
	},
	
	/**
	 * Removes a location from the current user's favourite locations
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: 
	 *	{
	 *		location: {Object}, //a location object as returned by getFavourites
	 *	}
	 * @param env {Object} Environment variables
	 */
	removeFavourite: function(success, fail, args, env) {
		_profile.removeNavigationFavourite(success, fail, args, env);
	},
	
	/**
	 * Gets the current user's navigation history
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getHistory: function(success, fail, args, env) {
		_profile.getNavigationHistory(success, fail, args, env);
	},
	
	/**
	 * Clears the current user's navigation history
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	clearHistory: function(success, fail, args, env) {
		_profile.clearNavigationHistory(success, fail, args, env);
	},
	
	/**
	 * Adds a location to the navigation history for a given user
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	addToNavigationHistory: function(success, fail, args, env) {
		_profile.addToNavigationHistory(success, fail, args, env);
	},
	
	/**
	 * Browse the POI database to find a destination
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	browsePOI: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			
			var categoryId = (!isNaN(args.categoryId)) ? args.categoryId : null;
			
			var location = args;
			if (location && !isNaN(location.categoryId)) {
				delete location.categoryId;
			}
			if (Object.keys(location).length <= 0) {
				location = null;
			}
			
			_provider.browsePOI(categoryId, location, success, fail);
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Search the POI database to find a destination
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	searchPOI: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);

			var name = (args.name) ? args.name : null;
			
			var location = args;
			if (location && location.name) {
				delete location.name;
			}
			if (Object.keys(location).length <= 0) {
				location = null;
			}

			_provider.searchPOI(name, location, success, fail);
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Shows a set of Destinations on a map
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	showOnMap: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_provider.showOnMap(args.locations);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Zoom the current map
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	zoomMap: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_provider.zoomMap(args.scale);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Pans the current map
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	panMap: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_provider.panMap(args.deltaX, args.deltaY);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Search to find a destination in the POI database or an address
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	searchAddress: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			var location = args;
			_provider.searchAddress(location, success, fail);
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Search to find a destination in the POI database or an address
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	navigateTo: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			var location = args;
			_provider.navigateTo(location, success, fail);
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Cancels the navigation if it is in progress
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	cancelNavigation: function(success, fail, args, env) {
		try {
			_provider.cancelNavigation();
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Gets the current navigation route
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	getRoute: function (success, fail, args, env) {
		try {
			var result = _provider.getRoute();
			success(result);
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Gets details about the current status of the navigation engine
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied
	 * @param env {Object} Environment variables
	 */
	getStatus: function(success, fail, args, env) {
		try {
			var result = _provider.getStatus();
			success(result);
		} catch (e) {
			fail(-1, e);
		}
	}
};

