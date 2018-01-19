/**
 * @module car_xyz_sensors
 * @static
 *
 * @description Provides access to custom automotive sensors.
 */
 
/* @author mlapierre
 * $Id: client.js 4326 2012-09-27 17:43:24Z mlapierre@qnx.com $
 */

var _self = {},
	_ID = require("./manifest.json").namespace,
	_callback = require('./../../lib/callback'),
	Event = require('./enum/Event');


// Sensor enumeration
_self.Sensor = require('./enum/Sensor');


/**
 * Watch for sensor changes
 * @param {Function} callback The function to call when a change is detected.
 * @return {Number} An ID for the added watch.
 * @memberOf module:car_xyz_sensors
 * @method watchSensors
 * @example
 * 
 * //define a callback function
 * function myCallback(sensorData) {
 *		//iterate through all the sensors
 		var sensors = Object.keys(sensorData);
 *		for (var i=0; i&lt;sensors.length; i++) {
 *			console.log("sensor name = " + sensors[i] + "; sensor value = " + sensorData[sensors[i]]);
 *		}
 * }
 * 
 * var watchId = car.sensors.watchSensors(myCallback);
 */
_self.watchSensors = function (callback) {
	return _callback.watch(Event.UPDATE, callback);
}


/**
 * Stop watching sensor changes
 * @param {Number} watchId The watch ID as returned by <i>car.sensors.watchSensors()</i>.
 * @memberOf module:car_xyz_sensors
 * @method cancelWatch 
 * @example
 * 
 * car.sensors.cancelWatch(watchId);
 */
_self.cancelWatch = function (watchId) {
	_callback.cancelWatch(watchId);
}

/**
 * @description <p>Return the current vehicle sensors
 * <p>If successful, the <i>successCallback</i> method is called with an object describing
 * the available sensors, their location (if applicable), and their values.
 * @param {Function} successCallback The function to call with the result on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @param {Array} [sensors] A list of <b>car.sensor.Sensor</b> values to whitelist.
 * @memberOf module:car_xyz_sensors
 * @method get 
 * @example 
 *
 * //define your callback function(s)
 * function successCallback(sensorData) {
 *		//iterate through all the sensors
 		var sensors = Object.keys(sensorData);
 *		for (var i=0; i&lt;sensors.length; i++) {
 *			console.log("sensor name = " + sensors[i] + "; sensor value = " + sensorData[sensors[i]]);
 *		}
 *
 *		//get the speed
 *		if (typeof sensorData[car.sensors.Sensor.SPEED] !== 'undefined') {
 *			console.log("speed = " + sensorData[car.sensors.Sensor.SPEED]);
 *		}
 * }
 *
 * function errorCallback(error) {
 *		console.log(error.code, error.msg);
 * }
 *
 * //optional: define a list of sensors by which to filter
 * var sensors = [ car.sensors.Sensor.SPEED, car.sensors.Sensor.RPM ];
 * //NOTE: this is equivalent to doing: var sensors = [ 'speed', 'rpm' ];
 *
 * //call the method
 * car.sensors.get(successCallback, errorCallback, sensors);
 *
 *
 * @example REST - with a filter
 *
 * Request:
 * http://&lt;car-ip&gt;/car/sensors/get?sensors=speed,rpm
 *
 * Success Response:
 * {
 *		code: 1,
 *		data: { speed: 50, rpm: 2000 }
 * }
 *
 * Error Response:
 * {
 *		code: -1,
 *		msg: "An error has occurred"
 * }
 */
_self.get = function (successCallback, errorCallback, sensors) {
	var args = (sensors) ? { sensors: sensors.join(',') } : null;
	window.webworks.exec(successCallback, errorCallback, _ID, 'get', args, false);
};


// Export
module.exports = _self;

