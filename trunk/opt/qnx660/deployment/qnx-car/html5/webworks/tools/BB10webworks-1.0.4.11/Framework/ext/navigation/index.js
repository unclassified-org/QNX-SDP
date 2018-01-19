/**
 * Allows control of GPS navigation 
 *
 * @author mlapierre
 * $Id: index.js 4277 2012-09-25 18:23:24Z mlapierre@qnx.com $
 */

var _event = require("../../lib/event"),
	_wwfix = require("../../lib/wwfix"),
	_utils = require("./../../lib/utils"),
	_userExt = _utils.loadExtensionModule("user", "index"),
	_actionMap = {
		/**
		 * @event
		 * Triggered when the navigation is updated
		 */
		navigationupdate: {
			context: require("./context"),
			event: "navigationupdate",
			trigger: function (args) {
				_event.trigger("navigationupdate", args);
			}
		},
		/**
		 * @event
		 * Triggered when the navigation is started
		 */
		navigationstarted: {
			context: require("./context"),
			event: "navigationstarted",
			trigger: function (args) {
				_event.trigger("navigationstarted", args);
			}
		},
		/**
		 * @event
		 * Triggered when the navigation is stopped
		 */
		navigationstopped: {
			context: require("./context"),
			event: "navigationstopped",
			trigger: function (args) {
				_event.trigger("navigationstopped", args);
			}
		},
  		/**
		 * @event
		 * Triggered when there is an error
		 */
		navigationerror: {
			context: require("./context"),
			event: "navigationerror",
			trigger: function (args) {
				_event.trigger("navigationerror", args);
			}
		},
		/**
		 * @event
		 * Triggered when the navigation is stopped
		 */
		navigationpoiresult: {
			context: require("./context"),
			event: "navigationpoiresult",
			trigger: function (args) {
				_event.trigger("navigationpoiresult", args);
			}
		},
		/**
		 * @event
		 * Triggered when the navigation is stopped
		 */
		navigationpoisearchresult: {
			context: require("./context"),
			event: "navigationpoisearchresult",
			trigger: function (args) {
				_event.trigger("navigationpoisearchresult", args);
			}
		},
  		/**
		 * @event
		 * Triggered when the navigation is stopped
		 */
		navigationsearchresult: {
			context: require("./context"),
			event: "navigationsearchresult",
			trigger: function (args) {
				_event.trigger("navigationsearchresult", args);
			}
		},
	},
	_navigation = require('./navigation')
	_provider = null;

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
		if(settings.navigationProvider) {
			try {
				_provider = require('./providers/' + settings.navigationProvider);
			} catch(ex) {
				// If this is an XMLHttpRequestException, then it's likely because the specified provider file simply does not exist
				// So, if this is another type of exception, we'll rethrow since there may be another problem
				if(ex instanceof XMLHttpRequestException === false) {
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
		return _userExt.getNavigationFavourites(success, fail, args, env);
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
		_userExt.addNavigationFavourite(success, fail, args, env);
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
		_userExt.removeNavigationFavourite(success, fail, args, env);
	},
	
	/**
	 * Gets the current user's navigation history
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getHistory: function(success, fail, args, env) {
		return _userExt.getNavigationHistory(success, fail, args, env);
	},
	
	/**
	 * Clears the current user's navigation history
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	clearHistory: function(success, fail, args, env) {
		_userExt.clearNavigationHistory(success, fail, args, env);
	},
	
	/**
	 * Adds a location to the navigation history for a given user
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	addToNavigationHistory: function(success, fail, args, env) {
		_userExt.addToNavigationHistory(success, fail, args, env);
	},
	
	/**
	 * Browse the POI database to find a destination
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: 
	 *	{
	 *		categoryId: {Number}, //the id of the category to browse. [optional]
	 *		location: {Object}, //a location object
	 *	}
	 * @param env {Object} Environment variables
	 */
	browsePOI: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			var categories = _provider.browsePOI(args.categoryId, args.location);
			success(categories);
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Search the POI database to find a destination
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: 
	 *	{
	 *		name: {String}, //the name of the location
	 *		id: {String}, //An identifier to return in the result of this query
	 *		location: {Object}, //a location object [optional]
	 *	}
	 * @param env {Object} Environment variables
	 */
	searchPOI: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_provider.searchPOI(args.name, args.id, args.location);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Shows a set of Destinations on a map
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		locations: {Array}, //an array of location objects
	 *	}
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
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		scale: {Number}, //the requested scale of the map
	 *	}
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
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		deltaX: {Number}, //the number of pixels to move the map on the X axis
	 *		deltaY: {Number}, //the number of pixels to move the map on the Y axis
	 *	}
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
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		location: {Object}, //the location we want to search for
	 *		id: {String}, //An identifier to return in the result of this query
	 *	}
	 * @param env {Object} Environment variables
	 */
	search: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_provider.search(args.location, args.id);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Search to find a destination in the POI database or an address
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: 
	 *	{
	 *		location: {Object}, //the location we want to navigate to
	 *	}
	 * @param env {Object} Environment variables
	 */
	navigateTo: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			_provider.navigateTo(args.location);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Cancels the navigation if it is in progress
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
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
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getRoute: function (success, fail, args, env) {
		try {
			var route = _provider.getRoute();
			success(route);
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Gets details about the current status of the navigation engine
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: N/A
	 * @param env {Object} Environment variables
	 */
	getStatus: function(success, fail, args, env) {
		try {
			var status = _provider.getStatus();
			success(status);
		} catch (e) {
			fail(-1, e);
		}
	}
};

