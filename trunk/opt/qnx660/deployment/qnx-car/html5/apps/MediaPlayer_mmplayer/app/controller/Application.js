/**
 * The controller responsible for application-level framework event handling
 * @author mlapierre
 *
 * $Id: Application.js 7092 2013-09-06 18:03:52Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.controller.Application', {
	extend: 'Ext.app.Controller',

	/**
	 * Initializes the controller on app startup
	 */
	init: function() {		

		// Event handlers for radio API status change event
		if (window.cordova) {
	 		document.addEventListener("pause", this.onPauseEvent.bind(this));
			document.addEventListener("resume", this.onResumeEvent.bind(this));
			document.addEventListener("reselect", this.onReselectEvent.bind(this));
		} else {
			blackberry.event.addEventListener("pause", this.onPauseEvent.bind(this));
			blackberry.event.addEventListener("resume", this.onResumeEvent.bind(this));
			blackberry.event.addEventListener("reselect", this.onReselectEvent.bind(this));
		}

	},
	
	/**
	 * Method called when app is ready to launch
	 */
	launch: function() {
		car.sensors.get(this.onSensorsUpdate.bind(this), null, [car.sensors.Sensor.SPEED]);
		car.sensors.watchSensors(this.onSensorsUpdate.bind(this));
	},

	/**
	 * Fired when an automotive sensor value has changed
	 * @param {Object} data The event data
	 */
	onSensorsUpdate: function(data) {
		if (data && typeof data[car.sensors.Sensor.SPEED] !== "undefined") {
			if (this.driving && data[car.sensors.Sensor.SPEED] == 0) {
				this.driving = false;
			} else if (!this.driving && data[car.sensors.Sensor.SPEED] > 0) {
				this.driving = true;
			} else {
				return;
			}
			this.getApplication().fireEvent('car_driving', { isDriving: this.driving });
		}
	},

	/**
	 * Method called when an webworks pause event is received
	 * @param event {Object} The event details
	 */
	onPauseEvent: function(event) {
		this.getApplication().fireEvent('pause_event', (typeof event != "undefined") ? event : null);
	},

	/**
	 * Method called when an application resume event is received
	 * @param event {Object} The event details
	 */
	onResumeEvent: function(event) {
		if (typeof event === 'object' && event !== null
				&& event.hasOwnProperty('action')) {
			switch (event.action) {
				case 'radio':
					this.getApplication().fireEvent('radio_index');
					break;
	
				case 'audio':
					this.getApplication().fireEvent('audio_index');
					break;
	
				case 'video':
					this.getApplication().fireEvent('video_index');
					break;
	
				case 'search':
					this.getApplication().fireEvent('search_index', {
							'searchTerm': event.hasOwnProperty('search_term') ? event.search_term : null,
							'mediaSourceId' : event.hasOwnProperty('media_source_id') ? event.media_source_id : null
						});
					break;

				case 'pandora':
					this.getApplication().fireEvent('pandora_remote');
					break;

				default: 
					console.warn('MediaPlayer.controller.Application::onResumeEvent - Unknown resume action: ' + event.action);
			}
		}
	},

	/**
	 * Method called when an application reselect event is received
	 * @param event {Object} The event details
	 */
	onReselectEvent: function(event) {
		this.getApplication().fireEvent('home_index');
	}
});
