/**
 * @module car_xyz_radio
 * @static
 *
 * @description Manages the radio interface
 * 
 */

/* 
 * @author mlapierre
 * $Id: client.js 4582 2012-10-11 19:59:26Z mlapierre@qnx.com $
 */

var _ID = require("./manifest.json").namespace,
	_self = {},
	_callback = require('./../../lib/callback'),
	Event = require('./enum/Event');

/**
 * Watch for metadata updates
 * @param {Function} callback The function to call when a change is detected.
 * @return {Number} An ID for the added watch.
 * @memberOf module:car_xyz_radio
 * @method watchRadio 
 * @example
 * 
 * //define a callback function
 * function myCallback(metadata) {
 *		console.log("tuner = " + data.tuner + "\n" +
 *					"artist = " + data.artist + "\n" +
 *					"genre = " + data.genre + "\n" +
 *					"song = " + data.song + "\n" +
 *					"station = " + data.station + "\n" +
 *					"stationName = " + data.stationName + "\n" +
 *					"hd = " + data.hd
 *		);
 * }
 * 
 * var watchId = car.radio.watchRadio(myCallback);
 */
_self.watchRadio = function (callback) {
	return _callback.watch(Event.UPDATE, callback);
};

/**
 * Watch for preset updates
 * @param {Function} callback The function to call when a change is detected.
 * @return {Number} An ID for the added watch.
 * @memberOf module:car_xyz_radio
 * @method watchPresets  
 * @example
 * 
 * function myCallback(presets) {
 *		//iterate through all the presets
 *		for (var i=0; i&lt;presets.length; i++) {
 *			console.log("preset tuner = " + presets[i].tuner + "\n" +
 *						"preset station = " + presets[i].station + "\n" +
 *						"preset index = " + presets[i].index + "\n" +
 *						"preset group = " + presets[i].group
 *			);
 *		}
 * }
 * 
 * var watchId = car.radio.watchPresets(myCallback);
 */
_self.watchPresets = function (callback) {
	return _callback.watch(Event.PRESETS, callback);
};

/**
 * Stop watching for metadata updates
 * @param {Number} watchId The watch ID as returned by <i>car.radio.watchRadio()</i> or <i>car.radio.watchPresets()</i>.
 * @memberOf module:car_xyz_radio
 * @method cancelWatch   
 * @example
 * 
 * car.radio.cancelWatch(watchId);
 */
_self.cancelWatch = function (watchId) {
	_callback.cancelWatch(watchId);
};

/**
 * Return the list of available tuners
 * @param {Function} successCallback The function to call on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @memberOf module:car_xyz_radio
 * @method getTuners  
 * @example 
 *
 * //define your callback function(s)
 * function successCallback(tuners) {
 *		//iterate through all the tuners
 *		for (var i=0; i&lt;tuners.length; i++) {
 *			console.log("tuner name = " + tuners[i].tuner + "\n" +
 *						"tuner type = " + tuners[i].type + "\n" +
 *						"tuner range min = " + tuners[i].settings.rangeMin + "\n" +
 *						"tuner range max = " + tuners[i].settings.rangeMax + "\n" +
 *						"tuner range step = " + tuners[i].settings.rangeStep
 *			);
 *		}
 * }
 *
 * function errorCallback(error) {
 *		console.log(error.code, error.msg);
 * }
 *
 * //call the method
 * car.radio.getTuners(successCallback, errorCallback);
 *
 *
 *
 * @example REST
 *
 * Request:
 * http://&lt;car-ip&gt;/car/radio/getTuners
 *
 * Success Response:
 * {
 *		code: 1,
 *		data: [ 
 * 			{ 
 *				tuner: 'am', 
 *				type: 'analog', 
 *				settings: {
 *					rangeMin: 880,
 *					rangeMax: 1600,
 *					rangeStep: 10
 *				}
 *			}, { 
 *				tuner: 'fm', 
 *				type: 'analog', 
 *				settings: {
 *					rangeMin: 88.9,
 *					rangeMax: 107.1,
 *					rangeStep: 0.2
 *				}
 *			}
 *		]
 * }
 *
 * Error Response:
 * {
 *		code: -1,
 *		msg: "An error has occurred"
 * }
 */
_self.getTuners = function(successCallback, errorCallback) {
	window.webworks.exec(successCallback, errorCallback, _ID, 'getTuners', null, false);
};
		
/**
 * Set the active tuner by name
 * @param {String} tuner The name of tuner to set as active.
 * @param {Function} [successCallback] The function to call on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @memberOf module:car_xyz_radio
 * @method setTuner
 * @example 
 *
 * //define your callback function(s)
 * function successCallback() {
 *		console.log('tuner was successfully set');
 * }
 *
 * function errorCallback(error) {
 *		console.log(error.code, error.msg);
 * }
 *
 * //call the method
 * car.radio.setTuner('fm', successCallback, errorCallback);
 *
 *
 *
 * @example REST
 *
 * Request:
 * http://&lt;car-ip&gt;/car/radio/setTuner?tuner=fm
 *
 * Success Response:
 * {
 *		code: 1,
 * }
 *
 * Error Response:
 * {
 *		code: -1,
 *		msg: "An error has occurred"
 * }
 */
_self.setTuner = function(tuner, successCallback, errorCallback) {
	var args = { 
		tuner: tuner 
	};
	window.webworks.exec(successCallback, errorCallback, _ID, 'setTuner', args, false);
};

/**
 * @description <p>Tune to a specific station, optionally targeting a specific tuner
 * <p>If the specified tuner is not the active tuner, then the station will be 
 * automatically selected the next time that tuner is set as active.
 * @param {Number} station The target station.
 * @param {Function} successCallback The function to call on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @param {String} [tuner] The tuner name. If not specified, the active tuner is used.
 * @memberOf module:car_xyz_radio
 * @method setStation
 * @example 
 *
 * //define your callback function(s)
 * function successCallback() {
 *		console.log('station was successfully set');
 * }
 *
 * function errorCallback(error) {
 *		console.log(error.code, error.msg);
 * }
 *
 * //call the method
 * car.radio.setStation(88.5, successCallback, errorCallback);
 *
 *
 *
 * @example REST
 *
 * Request:
 * http://&lt;car-ip&gt;/car/radio/setStation?station=88.5
 *
 * Success Response:
 * {
 *		code: 1,
 * }
 *
 * Error Response:
 * {
 *		code: -1,
 *		msg: "An error has occurred"
 * }
 */
_self.setStation = function(station, successCallback, errorCallback, tuner) {
	var args = { 
		station: station 
	};
	if (tuner) {
		args.tuner = tuner;
	}
	window.webworks.exec(successCallback, errorCallback, _ID, 'setStation', args, false);
};

/**
 * @description <p>Get the presets for the current tuner
 * <p>Optionally, a tuner name can be specified, returning
 * presets for the specified tuner.
 * @param {Function} successCallback The function to call on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @param {String} [tuner] The tuner of the presets. If not specified, the active tuner is used.
 * @memberOf module:car_xyz_radio
 * @method getPresets
 * @example 
 *
 * //define your callback function(s)
 * function successCallback(presets) {
 *		//iterate through all the presets
 *		for (var i=0; i&lt;presets.length; i++) {
 *			console.log("preset tuner = " + presets[i].tuner + "\n" +
 *						"preset station = " + presets[i].station + "\n" +
 *						"preset index = " + presets[i].index + "\n" +
 *						"preset group = " + presets[i].group
 *			);
 *		}
 * }
 *
 * function errorCallback(error) {
 *		console.log(error.code, error.msg);
 * }
 *
 * //call the method
 * car.radio.getPresets(successCallback, errorCallback);
 *
 *
 *
 * @example REST
 *
 * Request:
 * http://&lt;car-ip&gt;/car/radio/getPresets
 *
 * Success Response:
 * {
 *		code: 1,
 *		data: [ 
 * 			{ 
 *				tuner: 'am', 
 *				station: '880', 
 *				index: 0, 
 *				group: 'am1', 
 *			}, { 
 *				tuner: 'am', 
 *				station: '1010', 
 *				index: 1, 
 *				group: 'am1', 
 *			},{
 *				...	
 *			}
 *		]
 * }
 *
 * Error Response:
 * {
 *		code: -1,
 *		msg: "An error has occurred"
 * }
 */
_self.getPresets = function(successCallback, errorCallback, tuner) {
	var args = {};
	if (tuner) {
		args.tuner = tuner;
	}
    window.webworks.exec(successCallback, errorCallback, _ID, 'getPresets', args, false);
};

/**
 * @description <p>Set the current station as a preset at the specified index
 * <p>You can optionally specify a different station and tuner as a preset. 
 * @param {Number} index The preset index.
 * @param {String} group The preset group.
 * @param {Number} [station] The station to set as the preset. If this is not specified, the current station is used.
 * @param {String} [tuner] The tuner of the presets. If not specified, the active tuner is used.
 * @param {Function} [successCallback] The function to call on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @memberOf module:car_xyz_radio
 * @method setPreset
 * @example 
 *
 * //define your callback function(s)
 * function successCallback() {
 *		console.log('preset was successfully set');
 * }
 *
 * function errorCallback(error) {
 *		console.log(error.code, error.msg);
 * }
 *
 * //call the method
 * car.radio.setPreset(0, 'am1', 1030, 'am', successCallback, errorCallback);
 *
 *
 *
 * @example REST
 *
 * Request:
 * http://&lt;car-ip&gt;/car/radio/setPreset?index=0&group=am1&station=1030&tuner=am
 *
 * Success Response:
 * {
 *		code: 1,
 * }
 *
 * Error Response:
 * {
 *		code: -1,
 *		msg: "An error has occurred"
 * }
 */
_self.setPreset = function(index, group, station, tuner, successCallback, errorCallback) {
	var args = { 
		index: index,
		group: group
	};
	if (station) {
		args["station"] = station;
	}
	if (tuner) {
		args["tuner"] = tuner;
	}
	window.webworks.exec(successCallback, errorCallback, _ID, 'setPreset', args, false);
};

/**
 * Seek for the next radio station in the specified direction
 * @param {String} direction The direction to seek ('up' or 'down').
 * @param {Function} [successCallback] The function to call on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @memberOf module:car_xyz_radio
 * @method seek
 * @example 
 *
 * //define your callback function(s)
 * function successCallback() {
 *		console.log('seek was successfully called');
 * }
 *
 * function errorCallback(error) {
 *		console.log(error.code, error.msg);
 * }
 *
 * //call the method
 * car.radio.seek('up', successCallback, errorCallback);
 *
 *
 *
 * @example REST
 *
 * Request:
 * http://&lt;car-ip&gt;/car/radio/seek?direction=up
 *
 * Success Response:
 * {
 *		code: 1,
 * }
 *
 * Error Response:
 * {
 *		code: -1,
 *		msg: "An error has occurred"
 * }
 */
_self.seek = function(direction, successCallback, errorCallback) {
	var args = { 
		direction: direction 
	};
    window.webworks.exec(successCallback, errorCallback, _ID, 'seek', args, false);
};

/**
 * Scan for available radio stations in the specified direction
 * @param {String} direction The direction to seek ('up' or 'down').
 * @param {Function} [successCallback] The function to call on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @memberOf module:car_xyz_radio
 * @method scan
 * @example 
 *
 * //define your callback function(s)
 * function successCallback() {
 *		console.log('scan was successfully called');
 * }
 *
 * function errorCallback(error) {
 *		console.log(error.code, error.msg);
 * }
 *
 * //call the method
 * car.radio.scan('up', successCallback, errorCallback);
 *
 *
 *
 * @example REST
 *
 * Request:
 * http://&lt;car-ip&gt;/car/radio/scan?direction=up
 *
 * Success Response:
 * {
 *		code: 1,
 * }
 *
 * Error Response:
 * {
 *		code: -1,
 *		msg: "An error has occurred"
 * }
 */
_self.scan = function(direction, successCallback, errorCallback) {
	var args = { 
		direction: direction 
	};
    window.webworks.exec(successCallback, errorCallback, _ID, 'scan', args, false);
};

/**
 * Stop station scanning if in progress
 * @param {Function} [successCallback] The function to call on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @memberOf module:car_xyz_radio
 * @method scanStop
 * @example 
 *
 * //define your callback function(s)
 * function successCallback() {
 *		console.log('scanStop was successfully called');
 * }
 *
 * function errorCallback(error) {
 *		console.log(error.code, error.msg);
 * }
 *
 * //call the method
 * car.radio.scanStop(successCallback, errorCallback);
 *
 *
 *
 * @example REST
 *
 * Request:
 * http://&lt;car-ip&gt;/car/radio/scanStop
 *
 * Success Response:
 * {
 *		code: 1,
 * }
 *
 * Error Response:
 * {
 *		code: -1,
 *		msg: "An error has occurred"
 * }
 */
_self.scanStop = function(successCallback, errorCallback) {
    window.webworks.exec(successCallback, errorCallback, _ID, 'scanStop', null, false);
};

/**
 * Get the current station metadata
 * @param {Function} [successCallback] The function to call on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @memberOf module:car_xyz_radio
 * @method getStatus
 * @example 
 *
 * //define your callback function(s)
 * function successCallback(data) {
 *			console.log("tuner = " + data.tuner + "\n" +
 *						"artist = " + data.artist + "\n" +
 *						"genre = " + data.genre + "\n" +
 *						"song = " + data.song + "\n" +
 *						"station = " + data.station + "\n" +
 *						"stationName = " + data.stationName + "\n" +
 *						"hd = " + data.hd
 *			);
 *		}
 * }
 *
 * function errorCallback(error) {
 *		console.log(error.code, error.msg);
 * }
 *
 * //call the method
 * car.radio.getStatus(successCallback, errorCallback);
 *
 *
 *
 * @example REST
 *
 * Request:
 * http://&lt;car-ip&gt;/car/radio/getStatus
 *
 * Success Response:
 * {
 *		code: 1,
 *		data: {
 *     		tuner: 'fm'
 *     		artist: 'Bjork',
 *     		genre: 'News & Entertainment',
 *     		song: 'All is Full of Love',
 *     		station: 91.5,
 *     		stationName: 'CBC Radio 1',
 *     		hd: false
 *		}
 * }
 *
 * Error Response:
 * {
 *		code: -1,
 *		msg: "An error has occurred"
 * }
 */
_self.getStatus = function(successCallback, errorCallback) {
	window.webworks.exec(successCallback, errorCallback, _ID, 'getStatus', null, false);
};


//Export
module.exports = _self;

