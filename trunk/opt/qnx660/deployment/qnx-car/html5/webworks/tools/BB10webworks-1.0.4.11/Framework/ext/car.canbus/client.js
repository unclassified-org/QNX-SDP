/**
 * @name car.canbus
 * @static
 *
 * Provides CAN bus access for automotive applications
 * 
 * NOTE: This API is a stub only; it is not yet implemented.
 *
 * For a list of OBD-II PIDs, please see: http://en.wikipedia.org/wiki/OBD-II_PIDs
 */
 
 /*
  * @author mlapierre
  * $Id: client.js 4326 2012-09-27 17:43:24Z mlapierre@qnx.com $
  */


var _self = {},
	_ID = require("./manifest.json").namespace,


/**
 * Reads the values from the CAN bus for the specified parameters
 * @param {Number} mode The CAN bus mode
 * @param {Number} pid The CAN bus pid
 * @param {Function} successCallback The callback that is called with the result on success
 * @param {Function} errorCallback (Optional) The callback that is called if there is an error
 * @example 
 *
 * //define your callback function(s)
 * function successCallback(data) {
 *		console.log("Data retrieved from CAN bus: " + data)
 * }
 *
 * function errorCallback(error) {
 *		console.log(error.code, error.msg);
 * }
 *
 * //example - read the speed
 * var mode = 0x01;
 * var pid = 0x0D;
 * car.canbus.read(mode, pid, successCallback, errorCallback);
 *
 *
 * @example REST
 *
 * Request:
 * http://<car-ip>/car/canbus/read?mode=1&pid=13
 *
 * Response:
 * {
 *		code: 1,
 *		data: 100
 * }
 *
 *
 * Error Response:
 * {
 *		code: -1,
 *		msg: "An error has occurred"
 * }
 */
_self.read = function(mode, pid, successCallback, errorCallback) {
	var args = {
		mode: mode,
		pid: pid
	};
	window.webworks.exec(successCallback, errorCallback, _ID, 'get', args, false);
};


//Export
module.exports = _self;

