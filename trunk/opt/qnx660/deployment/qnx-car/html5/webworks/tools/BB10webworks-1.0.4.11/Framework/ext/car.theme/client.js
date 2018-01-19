/**
 * @module car_xyz_theme
 * @static
 *
 * @description Provides access to HMI theming 
 */

/*
 * @author mlapierre
 * $Id: client.js 4596 2012-10-12 16:01:36Z edagenais@lixar.com $
 */

var _self = {},
	_ID = require("./manifest.json").namespace,
	_callback = require('./../../lib/callback'),
	Event = require('./enum/Event');

/**
 *
 * Load a theme and inject the stylesheet into the DOM
 * @param {Object} theme The theme to load.
 * @private
 */
function loadTheme(theme) {
//	
	if (theme && theme.id) {
	 	//verify that this application is themeable
	 	var styleNode = document.getElementById('theme-css');
	 	if (styleNode) {
	 		//find the name of the application
	 		var app = styleNode.getAttribute('app');

	 		//determing the CSS file for the application
			var themeCSS = 'platform:///apps/common/themes/' + theme.id + '/' + app + '/master.css';

	 		//apply the theme only if it is different than the current theme
	 		if (styleNode.getAttribute('href') !== themeCSS) {
		 		styleNode.setAttribute('href', themeCSS);
	 		}
	 	}
	}
 }

/**
 * Watch for theme changes
 * @param {Function} callback The function to call when a change is detected.
 * @return {Number} An ID for the added watch.
 * @memberOf module:car_xyz_theme
 * @method watchTheme
 * @example
 * 
 * //define a callback function
 * function myCallback(theme) {
 * 		console.log("theme id = " + theme.id + "; theme name = " + theme.name);
 * }
 * 
 * var watchId = car.theme.watchTheme(myCallback);
 */
_self.watchTheme = function (callback) {
	return _callback.watch(Event.UPDATE, callback);
}


/**
 * Stop watching theme changes
 * @param {Number} watchId The watch ID as returned by <i>car.theme.watchTheme()</i>.
 * @memberOf module:car_xyz_theme
 * @method cancelWatch
 * @example
 * 
 * car.theme.cancelWatch(watchId);
 */
_self.cancelWatch = function (watchId) {
	_callback.cancelWatch(watchId);
}

/**
 * Return a list of available themes
 * @param {Function} successCallback The function to call on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @memberOf module:car_xyz_theme
 * @method getList
 * @example 
 *
 * //define your callback function(s)
 * function successCallback(themes) {
 *		//iterate through all the themes
 *		for (var i=0; i&lt;themes.length; i++) {
 *			console.log("theme id = " + themes[i].id + "; theme name = " + themes[i].name);
 *		}
 * }
 *
 * function errorCallback(error) {
 *		console.log(error.code, error.msg);
 * }
 *
 * //call the method
 * car.theme.getList(successCallback, errorCallback);
 *
 *
 *
 * @example REST
 *
 * Request:
 * http://&lt;car-ip&gt;/car/theme/getList
 *
 * Success Response:
 * {
 *		code: 1,
 *		data: [ 
 *			{ id: 'default', name: 'Default' }, 
 *			{ id: 'titanium', name: 'Titanium' } 
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
 * Return the current theme
 * @param {Function} successCallback The function to call on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @memberOf module:car_xyz_theme
 * @method getActive
 * @example 
 *
 * //define your callback function(s)
 * function successCallback(theme) {
 *		console.log("theme id = " + theme.id + "; theme name = " + theme.name);
 * }
 *
 * function errorCallback(error) {
 *		console.log(error.code, error.msg);
 * }
 *
 * //call the method
 * car.theme.getActive(successCallback, errorCallback);
 *
 *
 *
 * @example REST
 *
 * Request:
 * http://&lt;car-ip&gt;/car/theme/getActive
 *
 * Success Response:
 * {
 *		code: 1,
 *		data: { id: 'default', name: 'Default' }
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
 * Change the current theme
 * @param {String} themeId The ID of the new theme.
 * @param {Function} [successCallback] The function to call on success.
 * @param {Function} [errorCallback] The function to call if there is an error.
 * @memberOf module:car_xyz_theme
 * @method setActive 
 * @example 
 *
 * //define your callback function(s)
 * function successCallback() {
 *		console.log("theme has been changed");
 * }
 *
 * function errorCallback(error) {
 *		console.log(error.code, error.msg);
 * }
 *
 * //call the method
 * car.theme.setActive('default', successCallback, errorCallback);
 *
 *
 *
 * @example REST
 *
 * Request:
 * http://&lt;car-ip&gt;/car/theme/setActive?themeId=default
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
_self.setActive = function(themeId, successCallback, errorCallback) {
	var args = { 
		themeId: themeId 
	};
	window.webworks.exec(successCallback, errorCallback, _ID, 'setActive', args, false);
};


//Export
module.exports = _self;


// Listen for theme changes and react as necessary
window.webworks.event.add('blackberry.event', Event.UPDATE, loadTheme);

//Initialize theme client if the DOM has been loaded, otherwise defer initialization until then
if (!document.body) {
	document.addEventListener('DOMContentLoaded', function(){
		_self.getActive(loadTheme);
	});
} else {
	_self.getActive(loadTheme);
}

