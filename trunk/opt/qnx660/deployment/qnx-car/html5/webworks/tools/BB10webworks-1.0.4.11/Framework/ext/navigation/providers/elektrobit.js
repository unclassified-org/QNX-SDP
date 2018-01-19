/**
 * Implements navigation functionality for Elektrobit
 *
 * @author mlapierre
 * $Id: navigation.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var	_pps = require('../../../lib/pps/ppsUtils'),
	_sqlite = require('../../../lib/sqlite'),
	_db,
	_statusPPS,
	_controlReaderPPS,
	_controlWriterPPS,
	_updateTrigger,
	_startedTrigger,
	_stoppedTrigger,
	_errorTrigger,
	_poiResultTrigger,
	_poiSearchResultTrigger,
	_searchResultTrigger,
	
	GET_LOCATIONS = 'SELECT l.*, c.type FROM locations l LEFT JOIN categories c ON l.categoryId = c.id';
	
/**
 * Initialization function
 */
function init() {
	try {
		_db = _sqlite.createObject();
		if (!_db || !_db.open('/dev/qdb/navigation')) {
			console.log("qnx.navigation::init [providers/elektrobit.js] Error opening db; path=/dev/qdb/navigation");
		}
	} catch (ex) {
		console.error('Error in webworks ext: navigation/providers/elektrobit.js:init():', ex);
	}
}
init();

/**
 * Method called when the navigation status object changes
 * @param event {Object} The PPS event
 */
function onStatusEvent(event) {
	if (event && event.changed) {
		
		//handle nav start/stop events
		if (event.changed.navigating) {
			if (event.data.navigating && _startedTrigger) {
				//nav started
				_startedTrigger();
			} else if (!event.data.navigating && _stoppedTrigger) {
				//nav stopped
				_stoppedTrigger();
			}
		}
		
		//handle navigation update events
		if (_updateTrigger) {
			var data = {};
			if (event.changed.total_time_remaining) {
				data["totalTimeRemaining"] = event.data.total_time_remaining;
			}
			if (event.changed.total_distance_remaining) {
				data["totalDistanceRemaining"] = event.data.total_distance_remaining;
			}
			if (event.changed.destination) {
				data["destination"] = event.data.destination;
			}
			if (event.changed.maneuvers) {
				data["maneuvers"] = event.data.maneuvers;
			}
			if (Object.keys(data).length > 0) {
				_updateTrigger(data);
			}
		}
	}
}

/**
 * Method called when the navigation control object has a response ready
 * @param event {Object} The PPS event
 */
function onControlEvent(event) {
	if (event && event.data && event.data.res) {
		switch (event.data.res) {
			case 'getPOIs':
				handlePoiResult(event.data);
				break;
				
			case 'getPOIsByName':
				handlePoiSearchResult(event.data);
				break;

			case 'search':
				handleSearchResult(event.data);
				break;

			case 'navigateTo': 
				if (_errorTrigger && event.changed.err) {
					_errorTrigger({ 
						code: parseInt(event.data.err), 
						message: event.data.errstr || 'An unknown error has occured'
					});
				}
				break;
		}
	}
}

/**
 * Function called when a POI browse result is available
 * @param data {Object} The incoming PPS data
 */
function handlePoiResult(data) {
	if (_poiResultTrigger) {
		var result = _db.query(GET_LOCATIONS);
		var locations = _sqlite.resultToArray(result);
		_poiResultTrigger({ locations: locations, id: data.id });
	}
}

/**
 * Function called when a POI search result is available
 * @param data {Object} The incoming PPS data
 */
function handlePoiSearchResult(data) {
	if (_poiSearchResultTrigger) {
		var result = _db.query(GET_LOCATIONS);
		var locations = _sqlite.resultToArray(result);
		_poiSearchResultTrigger({ locations: locations, id: data.id });
	}
}

/**
 * Function called when a search result is available
 * @param data {Object} The incoming PPS data
 */
function handleSearchResult(data) {
	if (_searchResultTrigger) {
		var result = _db.query(GET_LOCATIONS);
		var locations = _sqlite.resultToArray(result);
		_searchResultTrigger({ locations: locations, id: data.id });
	}
}

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Initializes the extension 
	 */
	init: function() {
		_statusPPS = _pps.createObject();
		_statusPPS.init();
		_statusPPS.onChange = onStatusEvent;
		_statusPPS.open("/pps/qnxcar/navigation/status", JNEXT.PPS_RDONLY);

		_controlReaderPPS = _pps.createObject();
		_controlReaderPPS.init();
		_controlReaderPPS.onChange = onControlEvent;
		_controlReaderPPS.open("/pps/qnxcar/navigation/control", JNEXT.PPS_RDONLY);

		_controlWriterPPS = _pps.createObject();
		_controlWriterPPS.init();
		_controlWriterPPS.open("/pps/qnxcar/navigation/control", JNEXT.PPS_WRONLY);
	},

	/**
	 * Sets the trigger function to call when a navigation update event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setUpdateTrigger: function(trigger) {
		_updateTrigger = trigger;
	},
	
	/**
	 * Sets the trigger function to call when a navigation started event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setStartedTrigger: function(trigger) {
		_startedTrigger = trigger;
	},
	
	/**
	 * Sets the trigger function to call when a navigation stopped event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setStoppedTrigger: function(trigger) {
		_stoppedTrigger = trigger;
	},

	/**
	 * Sets the trigger function to call when a navigation error event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setErrorTrigger: function(trigger) {
		_errorTrigger = trigger;
	},

	/**
	 * Sets the trigger function to call when a poi browse result set is available
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setPOIResultTrigger: function(trigger) {
		_poiResultTrigger = trigger;
	},
	
	/**
	 * Sets the trigger function to call when a poi search result set is available
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setPOISearchResultTrigger: function(trigger) {
		_poiSearchResultTrigger = trigger;
	},

	/**
	 * Sets the trigger function to call when a search result set is available
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setSearchResultTrigger: function(trigger) {
		_searchResultTrigger = trigger;
	},
	
	/**
	 * Browse the POI database near a location
	 * @param categoryId {Number} A category id to browse [optional, defaults to 0 for root category]
	 * @param location {Object} The location around which we want to find a POI [optional, defaults to current location]
	 * @returns {Array} An array of category objects
	 * Ex: [{
	 *		id: {Number},			//the id of the category
	 *		name: {String},			//the name of the category
	 *		type: {String},			//the poi type of the category
	 * }]
	 */
	browsePOI: function(categoryId, location) {
		if (isNaN(categoryId)) {
			categoryId = 0;
		}
		
		var result = _db.query("SELECT * FROM categories WHERE parentId=" + categoryId);
		var categories = _sqlite.resultToArray(result);
		if (categories.length == 0) {
			var dat = {
				category: categoryId,
			};
			if (typeof location == 'object') {
				dat['location'] = location;
			}
			_controlWriterPPS.write({
				msg: 'getPOIs',
				dat: dat,
			});
		}
		return categories;
	},
	
	/**
	 * Search the POI database near a location
	 * @param name {String} The name of the location
	 * @param {String} id An identifier to return in the result of this query [optional]
	 * @param location {Object} The location around which we want to find a POI [optional, defaults to current location]
	 */
	searchPOI: function(name, id, location) {
		var dat = {
			name: name,
		};
		if (typeof location == 'object') {
			dat['location'] = location;
		}
		_controlWriterPPS.write({
			msg: 'getPOIsByName',
			id: id,
			dat: dat,
		});
	},

	/**
	 * Shows a set of locations on a map
	 * @param locations {Array} An array of locations to show on the map
	 */
	showOnMap: function(locations) {
		_controlWriterPPS.write({
			msg: 'showOnMap',
			dat: {
				locations: locations,
			}
		});
	},
	
	/**
	 * Zoom the current map
	 * @param scale {Number} The zoom scale
	 */
	zoomMap: function(scale) {
		_controlWriterPPS.write({
			msg: 'zoomMap',
			dat: {
				scale: scale,
			}
		});
	},
	
	/**
	 * Pans the current map
	 * @param deltaX {Number} The number of pixels to move the map on the X axis
	 * @param deltaY {Number} The number of pixels to move the map on the Y axis
	 */
	panMap: function(deltaX, deltaY) {
		_controlWriterPPS.write({
			msg: 'panMap',
			dat: {
				deltaX: deltaX,
				deltaY: deltaY,
			}
		});
	},
	
	/**
	 * Search to find a location based on a partial address
	 * @param location {Object} The location we want to search for
	 * @param id {String} An identifier to return in the result of this query [optional]
	 */
	search: function(location, id) {
		if (typeof location == 'object') {
			var dat = {};

			if (typeof location.country == 'string') {
				dat["country"] = location.country;
			}
			if (typeof location.city == 'string') {
				dat["city"] = location.city;
			}
			if (typeof location.street == 'string') {
				dat["street"] = location.street;
			}
			if (typeof location.number == 'string') {
				dat["number"] = location.number;
			}

			if (Object.keys(dat).length > 0) {
				_controlWriterPPS.write({
					msg: 'search',
					id: id,
					dat: dat
				});
			}
		}		
	},
	
	/**
	 * Navigate to a specific location
	 * @param location {Object} The location we want to navigate to
	 */
	navigateTo: function(location) {
		_controlWriterPPS.write({
			msg: 'navigateTo',
			dat: {
				location: location,
			}
		});
	},
	
	/**
	 * Cancels the navigation if it is in progress
	 */
	cancelNavigation: function() {
		_controlWriterPPS.write({
			msg: 'cancelNavigation',
		});
	},
	
	/**
	 * Gets the current navigation route
	 * @returns {Array} An array of navigation route segments, or null if not navigating
	 * Ex:
	 *	 [{
	 *		currentRoad: {String},		//name of the current road
	 *		command: {String},			//command to execute to transition to the next road
	 *		distance: {Number},			//distance covered by this segment, in metres
	 *		time: {Number},				//amount of time required to cover this segment, in minutes
	 *		latitude: {Number},			//latitude at the end of this segment
	 *		longitude: {Number},		//longitude at the end of this segment
	 *	}]
	 */
	getRoute: function() {
		try {
			return (_statusPPS.ppsObj.navigating) ? _statusPPS.ppsObj.route : null;
		} catch (e) {
			console.error('navigation/providers/elektrobit::getRoute error', e);
			return null;
		}
	},
	
	/**
	 * Gets details about the current status of the navigation engine
	 * @return {Object} A navigation status object
	 * Ex:
	 *	 {
	 *		isNavigating: {Boolean},			//true if navigation is in progress, otherwise false
	 *		segment: {Number},					//the index of the current route segment [present if isNavigating=true]
	 *		segmentDistanceRemaining: {Number},	//the distance remaining in the current segment, in metres [present if isNavigating=true]
	 *		totalTimeRemaining: {Number},		//the amount of time remaining in the route, in seconds [present if isNavigating=true]
	 *		totalDistanceRemaining: {Number},	//the distance remaining in the route, in metres [present if isNavigating=true]
	 *	};
	 */
	getStatus: function() {
		try {
			if (typeof _statusPPS.ppsObj.navigating == 'boolean' && _statusPPS.ppsObj.navigating === true) {
				return {
					isNavigating: 			true,
					maneuvers: 				_statusPPS.ppsObj.maneuvers,
					destination: 			_statusPPS.ppsObj.destination,
					totalTimeRemaining: 	_statusPPS.ppsObj.total_time_remaining,
					totalDistanceRemaining: _statusPPS.ppsObj.total_distance_remaining,
				};
			} else {
				return {
					isNavigating: 			false,
				};
			}
		} catch (e) {
			console.error('navigation/providers/elektrobit::getStatus error', e);
			return null;
		}
	},	
};
