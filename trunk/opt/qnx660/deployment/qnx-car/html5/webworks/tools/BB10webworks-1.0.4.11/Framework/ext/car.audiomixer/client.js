/**
 * @module car_xyz_audiomixer
 * @static
 *
 * @description Controls the audio mixer
 */
 
 /*
  * @author mlapierre
  * $Id: client.js 4326 2012-09-27 17:43:24Z mlapierre@qnx.com $
  */


var _self = {},
	_ID = require("./manifest.json").namespace,
	_callback = require('./../../lib/callback'),
	Event = require('./enum/Event');

// to refer to the audio mixer setting
_self.AudioMixerSetting = require('./enum/AudioMixerSetting');

/**
 * Watch for audio mixer changes
 * @param {Function} callback The function to call when a change is detected.
 * @return {Number} An ID for the added watch.
 * @memberOf module:car_xyz_audiomixer 
 * @method watchAudioMixer
 * @example
 * 
 * //define a callback function
 * function myCallback(audioMixerItems) {
 *		//iterate through the changed items
 *		for (var i=0; i&lt;audioMixerItems.length; i++) {
 *			console.log("audio mixer item setting = " + audioMixerItems[i].setting + '\n' +	//a car.audiomixer.AudioMixerSetting value
 *						"audio mixer item zone = " + audioMixerItems[i].zone + '\n' +		//a car.Zone value
 *						"audio mixer item value = " + audioMixerItems[i].value + '\n\n');	//a numeric value
 *		}
 * }
 * 
 * var watchId = car.audiomixer.watchAudioMixer(myCallback);
 */
_self.watchAudioMixer = function (callback) {
	return _callback.watch(Event.UPDATE, callback);
}


/**
 * Stop watching audio mixer changes
 * @param {Number} watchId The watch ID returned by <i>car.audiomixer.watchAudioMixer()</i>.
 * @memberOf module:car_xyz_audiomixer
 * @method cancelWatch
 * @example
 * 
 * car.audiomixer.cancelWatch(watchId);
 */
_self.cancelWatch = function (watchId) {
	_callback.cancelWatch(watchId);
}


/**
 * @desc <p>Return the audio mixer settings for a specific zone
 * <p>If successful, <i>car.audiomixer.get()</i> calls the <i>successCallback</i> function with the <b>car.Zone</b> object for the specific zone.
 * @param {Function} successCallback The function to call with the result on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @param {String} [zone] The zone to filter the results by.
 * @memberOf module:car_xyz_audiomixer
 * @method get
 * @see car.Zone 
 * @example 
 *
 * //define your callback function(s)
 * function successCallback(audioMixerItems) {
 *		//iterate through all the audio mixer items
 *		for (var i=0; &lt;i<audioMixerItems.length; i++) {
 *			console.log("audio mixer item setting = " + audioMixerItems[i].setting + '\n' +	//a car.audiomixer.AudioMixerSetting value
 *						"audio mixer item zone = " + audioMixerItems[i].zone + '\n' +		//a car.Zone value
 *						"audio mixer item value = " + audioMixerItems[i].value);			//a numeric value
 *		}
 * }
 *
 * function errorCallback(error) {
 *		console.log(error.code, error.msg);
 * }
 *
 * //Optional: provide a car.Zone filter to retrieve values for only that zone.
 * //If omitted, settings for all zones will be returned.
 * var zone = car.Zone.FRONT;
 *
 * //call the method
 * car.audiomixer.get(successCallback, errorCallback, zone);
 *
 *
 * @example REST - single zone
 *
 * Request:
 * http://<car-ip>/car/audiomixer/get?zone=all
 *
 * Response:
 * {
 *		code: 1,
 *		data: [
 * 			{ setting: 'volume', zone: 'all', value: 50 }
 *		]
 * }
 *
 *
 * @example REST - multi zone
 *
 * Request:
 * http://<car-ip>/car/audiomixer/get
 *
 * Success Response:
 * {
 *		code: 1,
 *		data: [
 *			{ setting: 'volume', zone: 'all', value: 50 },
 *			{ setting: 'bass', zone: 'all', value: 6 },
 *		]
 * }
 *
 * Error Response:
 * {
 *		code: -1,
 *		msg: "An error has occurred"
 * }
 */
_self.get = function(successCallback, errorCallback, zone) {
	var args = {};
	if (zone) {
		args.zone = (typeof zone == 'string' && zone.length > 0) ? zone : null;
	}
	window.webworks.exec(successCallback, errorCallback, _ID, 'get', args, false);
};


/**
 * Save an audio mixer setting
 * @param {String} setting A <b>car.audiomixer.AudioMixerSetting</b> value.  
 * @param {String} zone A <b>car.Zone</b> value.   
 * @param {Number} value The value to save.
 * @param {Function} [successCallback] The function to call on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @memberOf module:car_xyz_audiomixer
 * @method set
 * @see car.audiomixer.AudioMixerSetting
 * @see car.Zone  
 *
 * @example
 * //option 1: Set the volume in the entire car to 50 using constants.
 * car.audiomixer.set(car.audiomixer.AudioMixerSetting.VOLUME, car.Zone.ALL, 50);
 *
 * //option 2: Set the volume in the entire car to 50 without using constants.
 * car.audiomixer.set('volume', 'all', 50);
 *
 *
 * @example REST
 *
 * Request:
 * http://<car-ip>/car/audiomixer/set?setting=volume&zone=all&value=50
 *
 * Success Response:
 * {
 *		code: 1
 * }
 *
 * Error Response:
 * {
 *		code: -1,
 *		msg: "An error has occurred"
 * }
 */
_self.set = function(setting, zone, value, successCallback, errorCallback) {
	var args = { 
		setting: setting, 
		zone: zone, 
		value: value 
	};
	window.webworks.exec(successCallback, errorCallback, _ID, 'set', args, false);
};


//Export
module.exports = _self;

