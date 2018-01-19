/**
 * The controller responsible for the navigation box.
 * @author mlapierre
 *
 * $Id: Navigation.js 6663 2013-06-24 20:35:49Z mlapierre@qnx.com $
 */
Ext.define('Home.controller.Navigation', {
	extend: 'Ext.app.Controller',

	config: {
		refs: {
			navTitle	: 'navigationWidget container[action="nav-title"]',
			navImage	: 'navigationWidget image[action="nav-image"]',
			navDistance	: 'navigationWidget container[action="nav-distance"]',
			navCards	: 'navigationWidget container[action="nav-cards"]',
			navEnabled	: 'navigationWidget container[action="nav-enabled"]',
			navDisabled	: 'navigationWidget container[action="nav-disabled"]',
		},
		isNavigating: false,
	},
	
	/**
	 * Initializes the controller on app startup
	 */
	init: function() {
		this.getApplication().on({
			nav_event: this.onNavEvent,
			scope: this
		});
	},	
	
	/**
	 * Method called when app is ready to launch
	 */
	launch: function() {
		car.navigation.watchNavigation(this.onNavEvent.bind(this));

		car.navigation.getStatus(function (data) {
			if (data.isNavigating) {
				this.onNavStartEvent();
			}		
		}.bind(this));
	},

	/**
	 * Method called when pps event is fired on the navigation context
	 * @param event {Object} The event details
	 */
	onNavEvent: function(event) {
		//automatically set navigating to true if we get an event while nav is stopped
		//required for TCS
		if (this.getIsNavigating() === false) {
			this.onNavStartEvent();
		}

		//turn navigation off when required
		if (typeof event.isNavigating !== 'undefined' && event.isNavigating === false) {
			this.onNavStopEvent();
		}

		//redraw the maneuver
		if (event.maneuvers) {
			this.getNavTitle().setHtml((event.maneuvers[0].street) ? event.maneuvers[0].street : 'Unknown Street');
			this.getNavImage().setSrc(this.findImage(event.maneuvers[0].command));
			this.getNavDistance().setHtml(this.prettyDistance(event.maneuvers[0].distance));
		}
	},
	
	/**
	 * Method called when navigation starts
	 * @param event {Object} The event details
	 */
	onNavStartEvent: function(event) {
		this.setIsNavigating(true);
		this.getNavCards().setActiveItem(this.getNavEnabled());
	},

	/**
	 * Method called when navigation stops
	 * @param event {Object} The event details
	 */
	onNavStopEvent: function(event) {
		this.setIsNavigating(false);

		//clear the previous data to avoid a flicker the next time we start to navigate
		this.getNavDistance().setHtml('');
		this.getNavImage().setSrc('resources/img/blank.png');
		
		//reset the title and switch the card
		this.getNavTitle().setHtml('Navigation is not in progress.');
		this.getNavCards().setActiveItem(this.getNavDisabled());
	},
	
	/**
	 * Determines the image to show for the navigation command
	 * @param command {String} The navigation command
	 * @return {String} The url of the navigation image to show 
	 */
	findImage: function(command) {
		if (command && command.length > 0) {
			return 'resources/img/navigation/turns/xlarge-' + command.toLowerCase().replace(/\.+$/, '').replace(/\./g, '-') + '.png';
		} else {
			return '';
		}
	},
	
	/**
	 * Pretty print the distance
	 * @param distance {Number} The distance in meters
	 * @return {String} A user readable distance in KM
	 */
	prettyDistance: function(distance) {
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
	}
});

