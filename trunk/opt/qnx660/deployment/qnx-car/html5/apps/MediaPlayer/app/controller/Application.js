/**
 * The controller responsible for application-level framework event handling
 * @author mlapierre
 *
 * $Id: Application.js 5908 2013-03-19 17:31:23Z dkerr@qnx.com $
 */
Ext.define('MediaPlayer.controller.Application', {
	extend: 'Ext.app.Controller',

	/**
	 * Initializes the controller on app startup
	 */
	init: function() {		
        blackberry.event.addEventListener("pause", this.onPauseEvent.bind(this));
        blackberry.event.addEventListener("resume", this.onResumeEvent.bind(this));
        blackberry.event.addEventListener("reselect", this.onReselectEvent.bind(this));

        blackberry.event.addEventListener("mediasourceadded", this.onMediaSourceAdded.bind(this));
        blackberry.event.addEventListener("mediasourceremoved", this.onMediaSourceRemoved.bind(this));
	},
	
	/**
	 * Method called when app is ready to launch
	 */
	launch: function() {
		var currentSpeed = qnx.sensors.get('speed');
		this.driving = (currentSpeed > 0);
		blackberry.event.addEventListener('sensorsupdate', this.onSensorsUpdate.bind(this));

		this.getApplication().fireEvent('car_driving', { isDriving: this.driving });
	},

	/**
	 * Fired when the QnxCar framework sends a speed change event
	 * @param e {Object} The event containing the new speed
	 */
	onSensorsUpdate: function(e) {
		if (this.driving && e.data == 0) {
			this.driving = false;
		} else if (!this.driving && e.data > 0) {
			this.driving = true;
		} else {
			return;
		}
		
		this.getApplication().fireEvent('car_driving', { isDriving: this.driving });
	},

	/**
	 * Method called when an webworks pause event is received
	 * @param event {Object} The event details
	 */
	onPauseEvent: function(event) {
	    this.getApplication().fireEvent('pause_event', (typeof event != "undefined") ? event : null);
	},

	/**
	 * Method called when an webworks resume event is received
	 * @param event {Object} The event details
	 */
	onResumeEvent: function(event) {
		if (event && typeof event.action != 'undefined') {
		    this.getApplication().fireEvent('home_index', event);
		}
	},

	/**
	 * Method called when an webworks reselect event is received
	 * @param event {Object} The event details
	 */
	onReselectEvent: function(event) {
	    this.getApplication().fireEvent('home_index', (typeof event != "undefined") ? event : null);
	},

	/**
	 * Method called when a media source is added
	 * @param source {Object} The media source object
	 */
	onMediaSourceAdded: function(source) {
		//translate the framework event to a sencha event
		if (source && typeof source.id == 'string') {
			var store = Ext.getStore('MediaSources');
			var index = store.findExact('id', source.id);
			if (index > -1) {
				store.removeAt(index);
			} 
			store.add(source);
		}

		this.getApplication().fireEvent('mediasource_added', source);
	},

	/**
	 * Method called when a media source is added or removed
	 * @param source {Object} The media source object
	 */
	onMediaSourceRemoved: function(source) {
		//translate the framework event to a sencha event
		if (source && typeof source.id == 'string') {
			var store = Ext.getStore('MediaSources');
			var index = store.findExact('id', source.id);
			if (index > -1) {
				store.removeAt(index);
			}
		}

		this.getApplication().fireEvent('mediasource_removed', { id: source.id });
	},
});
