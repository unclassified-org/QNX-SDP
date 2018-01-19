/**
 * The controller responsible for qnx webworks setup and event handling
 * @author dkerr
 *
 * $Id: QnxCar.js 7019 2013-08-26 18:49:34Z nschultz@qnx.com $
 */
 
Ext.define('AppSection.controller.QnxCar', {

	extend: 'Ext.app.Controller',

	/**
	* Initializes the controller on app startup
	*/
	init: function() {

      	this.driving = false;
		//Initialize with current speed
		car.sensors.get(this.initSpeed.bind(this))

		car.sensors.watchSensors(this.onSpeedChange.bind(this));

		blackberry.event.addEventListener("reselect", this.onReselectEvent.bind(this));
		blackberry.event.addEventListener("resume", this.onResumeEvent.bind(this));
		
		blackberry.event.addEventListener("installed", this.onApplicationPPSEvent.bind(this));
		blackberry.event.addEventListener("uninstalled",this.onApplicationPPSEvent.bind(this));

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
	* Event handler to handle Applicaiton list events
	* */
	onApplicationPPSEvent: function(event) {
		this.getApplication().fireEvent('applicationPPS_event', event);
	},

	/**
	 * Event handler for navigator 'reselect' event.
	 * @param event {Object}
	 */
	onReselectEvent: function (event) {
		this.getApplication().fireEvent('reselect_event', (typeof event != "undefined") ? event : null);
	},
	 
	/**
	 * Event handler for navigator 'reselect' event.
	 * @param event {Object}
	 */
	onResumeEvent: function (event) {
		this.getApplication().fireEvent('resume_event', (typeof event != "undefined") ? event : null);
	},

	/**
	 * Fired when the sensors WebWorks extension sends a sensors update change event
	 * @param e {Object} The event containing the updated sensor data
	 */
	onSpeedChange:function (e) {
		if (e && e.speed !== undefined && typeof e.speed == 'number') {
			if ((this.driving && e.speed == 0) || (!this.driving && e.speed > 0)) {
				this.driving = (e.speed > 0);
				this.getApplication().fireEvent('car_driving', { isDriving:this.driving });
			}
		}
   	}
});