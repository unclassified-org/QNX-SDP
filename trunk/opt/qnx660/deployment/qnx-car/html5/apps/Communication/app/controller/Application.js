/**
 * The controller responsible for handling application-level framework events.
 * @author mlapierre, mlytvynyuk, lgreenway
 *
 * $Id: Application.js 7261 2013-09-26 14:53:11Z mlapierre@qnx.com $
 */
Ext.define('Communication.controller.Application', {
	extend: 'Ext.app.Controller',

	/**
	 * Method called when app is ready to launch
	 */
	launch: function() {
		this.driving = false;
		//Get current speed
		car.sensors.get(this.initSpeed.bind(this))
		
		// Add sensor change event listener
		car.sensors.watchSensors(this.onSpeedChange.bind(this));

		if (window.cordova) {
			// Add navigator resume event
			document.addEventListener("resume", this.onResumeEvent.bind(this));

			// Add navigator reselect event
	        document.addEventListener("reselect", this.onReselectEvent.bind(this));

		} else {
			// Add navigator resume event
			blackberry.event.addEventListener("resume", this.onResumeEvent.bind(this));

			// Add navigator reselect event
	        blackberry.event.addEventListener("reselect", this.onReselectEvent.bind(this));
		}
	},
	/**
	 * Handler to initialize the driving status on application launch
	 * @param sensorData {Object} object containing the object data
	 */
	initSpeed: function(sensorData){
		if (typeof sensorData[car.sensors.Sensor.SPEED] !== 'undefined') {
			this.driving = (sensorData[car.sensors.Sensor.SPEED] > 0);
 			this.getApplication().fireEvent('car_driving', { isDriving: this.driving });
 		}
	},
	/**
	 * Fired when the sensors WebWorks extension sends a sensorsupdate change event
	 * @param e {Object} The event containing the updated sensor data
	 */
	onSpeedChange: function(e) {
		if(e && e.speed !== undefined && typeof e.speed == 'number') {
			if (this.driving && e.speed == 0) {
				this.driving = false;
			} else if (!this.driving && e.speed > 0) {
				this.driving = true;
			} else {
				return;
			}
		}
		
		this.getApplication().fireEvent('car_driving', { isDriving: this.driving });
	},

	/**
	 * Method called when the application has received the resume event from the navigator.
	 * @param event {Object} The event details
	 */
	onResumeEvent: function(event) {
		if (event && event.action === 'contact-list') {
		    this.getApplication().fireEvent('search_index');
		}
	},

	/**
	 * Method called when the application has been reselected in the navigator.
	 * @param event {Object} The event details
	 */
	onReselectEvent: function(event) {
		this.getApplication().fireEvent('home_index');
		this.getApplication().fireEvent('menu_hide');
	}
});
