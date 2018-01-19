/**
 * The controller responsible for the map view.
 * @author mlapierre
 *
 * $Id: Map.js 7095 2013-09-06 18:58:54Z nschultz@qnx.com $
 */
Ext.define('Navigation.controller.Map', {
	extend: 'Ext.app.Controller',

	config: {
		refs: {
			map: 'map',
			message: 'map container[action=message]',
			directions: 'mapDirections',
			
			destinationAddress: 'mapDestination component[action=address]',
			destinationEta: 'mapDestination component[action=eta]',
		},
		control: {
			'map button[action=zoom-in]': {
				release: function() {
					car.navigation.zoomMap(1.5);
				}
			},
			'map button[action=zoom-out]': {
				release: function() {
					car.navigation.zoomMap(0.75);
				}
			},
			'map button[action=cancel-navigation]': {
				release: function() {
					car.navigation.cancelNavigation();
				}
			}
		}
	},

	/**
	 * Initializes the controller on app startup
	 */
	init: function() {
		this.getApplication().on({
			map_index: this.onMapIndex,
			navigation_error: this.onNavigationError,
			scope: this
		});
		
		car.navigation.watchNavigation(this.onNavigationEvent.bind(this));
	},
	
	/**
	 * Method called when app is ready to launch
	 */
	launch:function () {
		this.getMessage().setHidden(true);
		this.getDirections().setHidden(true);
		
		car.navigation.getStatus(function(status) {
			if (status && status.isNavigating) {
				this.onNavigationStarted();
				this.onNavigationUpdate(status);
			}
		});
	},
	
	/**
	 * Shows the map view
	 * @param args {Object} Arguments of the event
	 */
	onMapIndex: function(args) {
		Ext.Viewport.setActiveItem(this.getMap());
		
		if (args.routing) {
			this.getMessage().setHtml('Calculating Route...');
			this.getMessage().setHidden(false);
		}
	},

	/**
	 * Method called when the navigation position is updated
	 * @param event {Object} The event object
	 */
	onNavigationEvent: function(event) {
		//process start/stop updates
		if (typeof event.isNavigating !== 'undefined') {
			if (event.isNavigating) {
				this.onNavigationStarted();
			} else {
				this.onNavigationStopped();
			}
		}

		//process other updates if applicable
		this.onNavigationUpdate(event);
	},
	
	/**
	 * Method called when navigation is started
	 */
	onNavigationStarted: function() {
		this.getMessage().setHidden(true);
		this.getDirections().setHidden(false);
		
		//relead the history store
		Ext.getStore('History').load();
	},
	
	/**
	 * Method called when navigation is stopped
	 */
	onNavigationStopped: function() {
		this.getDirections().setHidden(true);
		
		//clear the ui nav data
		this.getDestinationAddress().setHtml('');
		this.getDestinationEta().setHtml('');
		var uiManeuvers = Ext.ComponentQuery.query('mapManeuver');
		for (var i=0; i<uiManeuvers.length; i++) {
			uiManeuvers[i].down('image').setSrc('resources/img/blank.png');
			uiManeuvers[i].down('container[action=streetname]').setHtml('');
			uiManeuvers[i].down('container[action=distance]').setHtml('');
		}
	},
	
	/**
	 * Method called when the navigation position is updated
	 * @param event {Object} The event object
	 */
	onNavigationUpdate: function(event) {
		if (event.destination) {
			this.getDestinationAddress().setHtml(this.determineAddress(event.destination));
		}
		//Need to check for undefined since a value of 0 will result in this block
		//not being executed and incorrectly displaying its last value 
		if (typeof event.totalTimeRemaining  !== "undefined") {
			this.getDestinationEta().setHtml(this.determineETA(event.totalTimeRemaining));
		}
		if (event.maneuvers) {
			var uiManeuvers = Ext.ComponentQuery.query('mapManeuver');
			for (var i=0; i<event.maneuvers.length && i<uiManeuvers.length; i++) {
				uiManeuvers[i].down('image').setSrc('resources/img/nav_turns/small-' + event.maneuvers[i].command + '.png');
				uiManeuvers[i].down('container[action=streetname]').setHtml(this.determineStreet(event.maneuvers[i].street));
				uiManeuvers[i].down('container[action=distance]').setHtml(this.determineDistance(event.maneuvers[i].distance));
			}
			if (uiManeuvers.length > event.maneuvers.length) {
				for (var i=event.maneuvers.length; i<uiManeuvers.length; i++) {
					uiManeuvers[i].down('image').setSrc('resources/img/blank.png');
					uiManeuvers[i].down('container[action=streetname]').setHtml('');
					uiManeuvers[i].down('container[action=distance]').setHtml('');
				}
			}
		}
	},
	
	/**
	 * Method called when there is a navigation error
	 * @param event {Object} The event object
	 */
	onNavigationError: function(event) {
		var errorMessage = (event && event.msg) ? error.msg : "An unknown error has occured";
		var message = this.getMessage();
		message.setHtml(errorMessage);
		message.setHidden(false);
		setTimeout(function() { message.setHidden(true); }, 5000);
	},
	
	/**
	 * Determines the address string to display based on the location info
	 * @param location {Object} A location object data structure
	 */
	determineAddress: function(location) {
		var address;
		
		//try number + street (ex: "123 Fake st")
		address = [location.number, location.street].join(' ').trim();
		if (address.length > 0) {
			return address;
		}
		
		//try name 
		if (typeof location.name == 'string' && location.name.length > 0) {
			return location.name;
		}
		
		//try city/province
		address = [location.city, location.province].join(' ').trim();
		if (address.length > 0) {
			return address;
		}
		
		//try postal code/country
		address = [location.postalCode, location.country].join(' ').trim();
		if (address.length > 0) {
			return address;
		}
		
		//no clue where you're going. 
		return 'Destination';
	},
	
	/**
	 * Determines the ETA string to display based on the number of minutes left
	 * @param minutes {Number} The number of minutes to the destination
	 */
	determineETA: function(minutes) {
		if (isNaN(minutes) || minutes < 0) {
			return 'ETA: ?? min.';
		} else if (minutes < 60) {
			if(minutes == 0){
				return 'ETA: <1 min.';
			}else{
				return 'ETA: ' + minutes + ' min.';
			}
		} else {
			return 'ETA: ' + Math.floor(minutes / 60) + ' h. ' + (minutes % 60) + ' min.';
		}
	},
	
	/**
	 * Determines the street string to display for a segment
	 * @param street {String} The street name coming from the API
	 */
	determineStreet: function(street) {
		if (typeof street == 'string' && street.length > 0) {
			return street;
		} else {
			return 'Unknown Street';
		}
	},
	
	/**
	 * Determines the distance string to display for a segment
	 * @param distance {Number} The distance coming from the API
	 */
	determineDistance: function(distance) {
		if (isNaN(distance)) {
			return '?? m';
		} else if (distance < 0) {
			return '0 m';
		} else if (distance < 1000) {
			return distance + ' m';
		} else if (distance < 100000){
			return (distance / 1000).toFixed(1) + ' km';
		} else {
			return Math.floor(distance / 1000) + ' km';
		}
	},
});
