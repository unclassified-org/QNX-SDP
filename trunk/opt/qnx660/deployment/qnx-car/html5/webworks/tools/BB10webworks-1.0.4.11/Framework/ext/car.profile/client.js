/**
 * @module car_xyz_profile
 * @static
 *
 * @description Manages the system user information
 * 
 */

/* 
 * @author mlapierre
 * $Id: client.js 4582 2012-10-11 19:59:26Z mlapierre@qnx.com $
 */

var _self = {},
	_ID = require("./manifest.json").namespace,
	_callback = require('./../../lib/callback'),
	Event = require('./enum/Event');

/**
 * Watch for profile changes
 * @param {Function} callback The function to call when a change is detected.
 * @return {Number} An ID for the added watch.
 * @memberOf module:car_xyz_profile
 * @method watchProfile
 * @example
 *
 *
 * //define a callback function
 * function myCallback(profile) {
 *		console.log("profile id = " + profile.id + "\n" +
 *					"profile name = " + profile.name + "\n" +
 *					"profile avatar = " + profile.avatar + "\n" +
 *					"profile theme = " + profile.theme + "\n" +
 *					"profile bluetooth device id = " + profile.bluetoothDeviceId
 * }
 *
 * var watchId = car.profile.watchProfile(myCallback);
 */
_self.watchProfile = function (callback) {
	return _callback.watch(Event.UPDATE, callback);
}

/**
 * Stop watching profile changes
 * @param {Number} watchId The watch ID returned by <i>car.profile.watchProfile()</i>.
 * @memberOf module:car_xyz_profile
 * @method cancelWatch 
 * @example
 *
 * car.profile.cancelWatch(watchId);
 */
_self.cancelWatch = function (watchId) {
	_callback.cancelWatch(watchId);
}

/**
 * Retrieve the current profile information
 * @param {Function} successCallback The function to call on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @memberOf module:car_xyz_profile
 * @method getActive 
 * @example 
 *
 * //define your callback function(s)
 * function successCallback(profile) {
 *		console.log("profile id = " + profile.id + "\n" +
 *					"profile name = " + profile.name + "\n" +
 *					"profile avatar = " + profile.avatar + "\n" +
 *					"profile theme = " + profile.theme + "\n" +
 *					"profile bluetooth device id = " + profile.bluetoothDeviceId
 *		);
 * }
 *
 * function errorCallback(error) {
 *		console.log(error.code, error.msg);
 * }
 *
 * //call the method
 * car.profile.getActive(successCallback, errorCallback);
 *
 *
 *
 * @example REST
 *
 * Request:
 * http://&lt;car-ip&gt;/car/profile/getActive
 *
 * Success Response:
 * {
 *		code: 1,
 *		data: { 
 *			id: 1, 
 *			name: 'John Doe', 
 *			avatar: 'platform:///path/to/avatar.png', 
 *			theme: 'default', 
 *			bluetoothDeviceId: '9D:BA:8E:43:ED:68' 
 *		}
 * }
 *
 * Error Response:
 * {
 *		code: -1,
 *		msg: "An error has occurred"
 * }
 */
_self.getActive = function(successCallback, errorCallback) {
	window.webworks.exec(successCallback, errorCallback, _ID, 'getActive', null, false);
};

/**
 * Change the active profile
 * @param {Number} profileId The ID of the profile to make active.
 * @param {Function} successCallback The function to call on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @memberOf module:car_xyz_profile
 * @method setActive
 * @example 
 *
 * //call the method
 * car.profile.setActive(1);
 *
 *
 *
 * @example REST
 *
 * Request:
 * http://&lt;car-ip&gt;/car/profile/setActive?profileId=1
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
_self.setActive = function(profileId, successCallback, errorCallback) {
	var args = { 
		profileId: profileId 
	};
	window.webworks.exec(successCallback, errorCallback, _ID, 'setActive', args, false);
};

/**
 * Return a list of available profiles
 * @param {Function} successCallback The function to call on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @memberOf module:car_xyz_profile
 * @method getList
 * @example 
 *
 * //define your callback function(s)
 * function successCallback(profiles) {
 *		//iterate through all the profiles
 *		for (var i=0; i&lt;profiles.length; i++) {
 *			console.log("profile id = " + profiles[i].id + "\n" +
 *						"profile name = " + profiles[i].name + "\n" +
 *						"profile avatar = " + profiles[i].avatar
 *						"profile avatar = " + profiles[i].avatar + "\n" +
 *						"profile theme = " + profiles[i].theme + "\n" +
 *						"profile bluetooth device id = " + profiles[i].bluetoothDeviceId
 *			);
 *		}
 * }
 *
 * function errorCallback(error) {
 *		console.log(error.code, error.msg);
 * }
 *
 * //call the method
 * car.profile.getList(successCallback, errorCallback);
 *
 *
 *
 * @example REST
 *
 * Request:
 * http://&lt;car-ip&gt;/car/profile/getList
 *
 * Success Response:
 * {
 *		code: 1,
 *		data: [ 
 * 			{ 
 *				id: 1, 
 *				name: 'John Doe', 
 *				avatar: 'platform:///path/to/avatar.png', 
 *				theme: 'default', 
 *				bluetoothDeviceId: '9D:BA:8E:43:ED:68' 
 *			}, { 
 *				id: 2, 
 *				name: 'Joe', 
 *				avatar: 'platform:///path/to/avatar.png', 
 *				theme: 'titanium', 
 *				bluetoothDeviceId: null 
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
_self.getList = function(successCallback, errorCallback) {
	window.webworks.exec(successCallback, errorCallback, _ID, 'getList', null, false);
};


/**
 * Create a new profile
 * @param {String} name The name of the profile.
 * @param {String} [avatar] The avatar for the profile.
 * @param {String} [theme] The preferred theme for the profile.
 * @param {String} [bluetoothDeviceId] The preferred Bluetooth device for the profile.
 * @param {Function} [successCallback] The function to call on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @memberOf module:car_xyz_profile
 * @method addProfile
 * @example 
 *
 * //define your callback function(s)
 * function successCallback(profileid) {
 *		console.log("profile id = " + profileid);
 * }
 *
 * function errorCallback(error) {
 *		console.log(error.code, error.msg);
 * }
 *
 * //call the method
 * car.profile.addProfile('Joe', 'platform:///path/to/avatar.png', 'default', '9D:BA:8E:43:ED:68', successCallback, errorCallback);
 *
 *
 *
 * @example REST
 *
 * Request:
 * http://&lt;car-ip&gt;/car/profile/addProfile?name=Joe&avatar=platform%3A%2F%2F%2Fpath%2Fto%2Favatar.png&themeId=default&bluetoothDeviceId=9D:BA:8E:43:ED:68
 *
 * Success Response:
 * {
 *		code: 1,
 *		data: [ 
 * 			{ 
 *				id: 2
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
_self.addProfile = function(name, avatar, theme, bluetoothDeviceId, successCallback, errorCallback) {
	var args = { 
		name: name 
	};
	if (avatar) {
		args.avatar = avatar;
	}
	if (theme) {
		args.theme = theme;
	}
	if (bluetoothDeviceId) {
		args.bluetoothDeviceId = bluetoothDeviceId;
	}
	window.webworks.exec(successCallback, errorCallback, _ID, 'addProfile', args, false);
};


/**
 * Update an existing profile
 * @param {Number} profileId The ID of the profile.
 * @param {String} [name] The name of the profile.
 * @param {String} [avatar] The avatar for the profile.
 * @param {String} [theme] The preferred theme for the profile.
 * @param {String} [bluetoothDeviceId] The preferred Bluetooth device for the profile.
 * @param {Function} [successCallback] The function to call on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @memberOf module:car_xyz_profile
 * @method updateProfile
 * @example 
 *
 * //define your callback function(s)
 * function successCallback() {
 *		console.log("profile has been updated");
 * }
 *
 * function errorCallback(error) {
 *		console.log(error.code, error.msg);
 * }
 *
 * //call the method
 * car.profile.updateProfile(2, 'Joe', 'platform:///path/to/avatar.png', 'default', '9D:BA:8E:43:ED:68', successCallback, errorCallback);
 *
 *
 *
 * @example REST
 *
 * Request:
 * http://&lt;car-ip&gt;/car/profile/updateProfile?profileId=2&name=Joe&avatar=platform%3A%2F%2F%2Fpath%2Fto%2Favatar.png&themeId=default&bluetoothDeviceId=9D:BA:8E:43:ED:68
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
_self.updateProfile = function(profileId, name, avatar, theme, bluetoothDeviceId, successCallback, errorCallback) {
	var args = { 
		profileId: profileId 
	};
	if (name) {
		args.name = name;
	}
	if (avatar) {
		args.avatar = avatar;
	}
	if (theme) {
		args.theme = theme;
	}
	if (bluetoothDeviceId) {
		args.bluetoothDeviceId = bluetoothDeviceId;
	}
	window.webworks.exec(successCallback, errorCallback, _ID, 'updateProfile', args, false);
};

/**
 * Delete an existing profile
 * @param {Number} profileId The ID of the profile.
 * @param {Function} [successCallback] The function to call on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @memberOf module:car_xyz_profile
 * @method deleteProfile
 * @example 
 *
 * //define your callback function(s)
 * function successCallback() {
 *		console.log("profile has been deleted");
 * }
 *
 * function errorCallback(error) {
 *		console.log(error.code, error.msg);
 * }
 *
 * //call the method
 * car.profile.deleteProfile(2, successCallback, errorCallback);
 *
 *
 *
 * @example REST
 *
 * Request:
 * http://&lt;car-ip&gt;/car/profile/deleteProfile?profileId=2
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
_self.deleteProfile = function(profileId, successCallback, errorCallback) {
	window.webworks.exec(successCallback, errorCallback, _ID, 'deleteProfile', { profileId: profileId }, false);
};

/**
 * Retrieve settings for the current profile
 * @param {Function} successCallback The function to call on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @param {Array} [settings] A list of settings to whitelist.
 * @memberOf module:car_xyz_profile
 * @method getSettings 
 * @example 
 *
 * //define your callback function(s)
 * function successCallback(settings) {
 *		//iterate through all the settings
 *		for (var i=0; i&lt;settings.length; i++) {
 *			console.log("setting key = " + settings[i].key + "\n" +
 *						"setting value = " + settings[i].value
 *			);
 *		}
 * }
 *
 * function errorCallback(error) {
 *		console.log(error.code, error.msg);
 * }
 *
 * //call the method
 * car.profile.getSettings(successCallback, errorCallback, ['hvac_fanSpeed_frontLeft', 'audio_volume_everywhere', 'radio_preset_am']);
 *
 *
 *
 * @example REST
 *
 * Request:
 * http://&lt;car-ip&gt;/car/profile/getSettings?settings=hvac_fanSpeed_all,hvac_airConditioning_all,radio_preset_am
 *
 * Success Response:
 * {
 *		code: 1,
 *		data: [
 *			{ key: 'hvac_fanSpeed_frontLeft', value: 1 },
 *			{ key: 'audio_volume_everywhere', value: 10 },
 *			{ key: 'radio_preset_am', value: [880,910,950,1020,1220,1430] }
 *		]
 * }
 *
 * Error Response:
 * {
 *		code: -1,
 *		msg: "An error has occurred"
 * }
 */
_self.getSettings = function(successCallback, errorCallback, settings) {
	var args = {};
	if (settings && settings.length > 0) {
		args.settings = settings.join(',');
	}
	window.webworks.exec(successCallback, errorCallback, _ID, 'getSettings', args, false);
};

/**
 * Set the value of a setting for the current profile
 * @param {String} key The key of the setting.
 * @param {Mixed} value The value of the setting.
 * @param {Function} [successCallback] The function to call on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @memberOf module:car_xyz_profile
 * @method setSetting
 * @example 
 *
 * //define your callback function(s)
 * function successCallback() {
 *		console.log("setting has been set");
 * }
 *
 * function errorCallback(error) {
 *		console.log(error.code, error.msg);
 * }
 *
 * //call the method
 * car.profile.setSettings('hvac_fanSpeed_frontLeft', 1, successCallback, errorCallback);
 *
 *
 *
 * @example REST
 *
 * Request:
 * http://&lt;car-ip&gt;/car/profile/setSettings?key=hvac_fanSpeed_frontLeft&value=1
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
_self.setSetting = function(key, value, successCallback, errorCallback) {
	var args = { 
		key: key, 
		value: value 
	};
	window.webworks.exec(successCallback, errorCallback, _ID, 'setSetting', args, false);
};


//Export
module.exports = _self;

