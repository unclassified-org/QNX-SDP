/**
 * @module qnx_xyz_navigation 
 * @description Allow control of GPS navigation 
 *
 * @deprecated Please use car.navigation instead.
 */

/* @author mlapierre
 * $Id: client.js 4664 2012-10-19 18:45:36Z nschultz@qnx.com $
 */

var _ID = require("./manifest.json").namespace;

/*
 * Exports are the publicly accessible functions
 */
module.exports = {
/**
 * Get the current user's favorite locations
 * @returns {Array} An array of favorite objects
 * @example
 *{
 *     id: {Number},            //the ID of the location
 *     name: {String},          //the name of the location
 *     number: {String},        //the civic number of the address
 *     street: {String},        //the street of the address
 *     city: {String},          //the city of the address
 *     province: {String},      //the province of the address
 *     postalCode: {String},    //the postal code/zip code of the address
 *     country: {String},       //the country of the address
 *     type: {String},          //the poi type of the location
 *     latitude: {Number},      //the latitude of the location
 *     longitude: {Number},     //the longitude of the location
 *}
 */
	getFavourites: function() {
	    return window.webworks.execSync(_ID, 'getFavourites');
	},
	/**
	 * Add a location to the current user's favorite locations
	 * @param {Object} location The location object as returned by getHistory(), browsePOI(), or search()
	 */
	addFavourite: function(location) {
	    window.webworks.execSync(_ID, 'addFavourite', { location: location });
	},
	
	/**
	 * Remove a location from the current user's favourite locations
	 * @param {Object} location The location object as returned by getFavourites()
	 */
	removeFavourite: function(location) {
	    window.webworks.execSync(_ID, 'removeFavourite', { location: location });
	},
	
	/**
	 * Get the current user's navigation history
	 * @returns {Array} An array of location objects showing the user's recent history
	 * @example
     *{
	 *     id: {Number},            //the ID of the location
	 *     name: {String},          //the name of the location
	 *     number: {String},        //the civic number of the address
	 *     street: {String},        //the street of the address
	 *     city: {String},          //the city of the address
	 *     province: {String},      //the province of the address
	 *     postalCode: {String},    //the postal code/zip code of the address
	 *     country: {String},       //the country of the address
	 *     type: {String},          //the poi type of the location
	 *     latitude: {Number},      //the latitude of the location
	 *     longitude: {Number},     //the longitude of the location
	 *     timestamp: {Number},     //the timestamp of when the location was visited
     *}
	 */
	getHistory: function() {
	    return window.webworks.execSync(_ID, 'getHistory');
	},
	
	/**
	 * Clear the current user's navigation history
	 */
	clearHistory: function() {
	    return window.webworks.execAsync(_ID, 'clearHistory');
	},
	
	/**
	 * Browse the POI (Point of Interest) database near a location
	 * @param {Number} categoryId A category ID to browse [optional]; defaults to 0 for root category
	 * @param {Object} location The location around which we want to find a POI [optional]; defaults to current location
	 * @returns {Array} An array of category objects
	 * @example
     *{
	 *     id: {Number},    //the ID of the category
	 *     name: {String},  //the name of the category
	 *     type: {String},  //the POI type of the category
     *}
	 */
	browsePOI: function(categoryId, location) {
		var args = {};
		if (!isNaN(categoryId)) {
			args['categoryId'] = categoryId;
		}
		if (typeof location == 'object') {
			args['location'] = location
		}
	    window.webworks.execAsync(_ID, 'browsePOI', args);
	},
	
	/**
	 * Search the POI (Point of Interest) database near a location
	 * @param {String} name The name of the location 
	 * @param {String} id An identifier to return in the result of this query [optional]
	 * @param {Object} location The location around which we want to find a POI [optional]; defaults to current location
	 */
	searchPOI: function(name, id, location) {
		var args = {};
		if (typeof name == 'string') {
			args['name'] = name;
		}
		if (typeof id == 'string') {
			args['id'] = id;
		}

		if (typeof location == 'object') {
			args['location'] = location
		}
		window.webworks.execAsync(_ID, 'searchPOI', args);
	},

	/**
	 * Show a set of locations on a map
	 * @param {Array} locations An array of locations to show on the map as returned by browsePOI(), search(), getFavourites(), or getHistory()
	 */
	showOnMap: function(locations) {
	    window.webworks.execAsync(_ID, 'showOnMap', { locations: locations });
	},
	
	/**
	 * Zoom the current map
	 * @param {Number} scale The zoom scale
	 */
	zoomMap: function(scale) {
	    window.webworks.execAsync(_ID, 'zoomMap', { scale: scale });
	},
	
	/**
	 * Pan the current map
	 * @param {Number} deltaX The number of pixels to move the map on the X axis
	 * @param {Number} deltaY The number of pixels to move the map on the Y axis
	 */
	panMap: function(deltaX, deltaY) {
	    window.webworks.execAsync(_ID, 'panMap', { deltaX: deltaX, deltaY: deltaY });
	},
	
	/**
	 * Find a location based on a partial address
	 * @param {Object} location The location we want to search for
	 * @param {String} id An identifier to return in the result of this query [optional]
	 */
	search: function(location, id) {
		var args = {};

		if (typeof location == 'object') {
			args['location'] = location
		}

		if (typeof id == 'string') {
			args['id'] = id;
		}

	    window.webworks.execAsync(_ID, 'search', args);
	},
	
	/**
	 * Navigate to a specific location
	 * @param {Object} location The location we want to navigate to
	 * @example
     *{
	 *     name: {String},          //the name of the location
	 *     number: {String},        //the civic number of the address
	 *     street: {String},        //the street of the address
	 *     city: {String},          //the city of the address
	 *     province: {String},      //the province of the address
	 *     postalCode: {String},    //the postal code/zip code of the address
	 *     country: {String},       //the country of the address
	 *     type: {String},          //the poi type of the location
	 *     latitude: {Number},      //the latitude of the location
	 *     longitude: {Number},     //the longitude of the location
     *}
	 */
	navigateTo: function(location) {
	    window.webworks.execAsync(_ID, 'navigateTo', { location: location });
	    window.webworks.execAsync(_ID, 'addToNavigationHistory', { location: location });
	},
	
	/**
	 * Cancel the navigation if it is in progress
	 */
	cancelNavigation: function() {
	    window.webworks.execAsync(_ID, 'cancelNavigation');
	},

	/**
	 * Get the current navigation route
	 * @returns {Array} An array of navigation route segments, or null if not navigating
	 * @example
     *{
	 *     currentRoad: {String},   //name of the current road
	 *     command: {String},       //command to execute to transition to the next road
	 *     distance: {Number},      //distance covered by this segment, in metres
	 *     time: {Number},          //amount of time required to cover this segment, in minutes
	 *     latitude: {Number},      //latitude at the end of this segment
	 *     longitude: {Number},     //longitude at the end of this segment
     *}
	 */
	getRoute: function () {
	    return window.webworks.execSync(_ID, 'getRoute');
	},

	/**
	 * Get details about the current status of the navigation engine
	 * @return {Object} A navigation status object
	 * @example
     *{
	 *     isNavigating: {Boolean},             //true if navigation is in progress, otherwise false
	 *     segment: {Number},                   //the index of the current route segment [present if isNavigating=true]
	 *     segmentDistanceRemaining: {Number},  //the distance remaining in the current segment, in metres [present if isNavigating=true]
	 *     totalTimeRemaining: {Number},        //the amount of time remaining in the route, in seconds [present if isNavigating=true]
	 *     totalDistanceRemaining: {Number},    //the distance remaining in the route, in metres [present if isNavigating=true]
     *}
	 */
	getStatus: function () {
	    return window.webworks.execSync(_ID, 'getStatus');
	},
};