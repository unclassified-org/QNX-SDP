/**
 * @module qnx_xyz_locale
 * @description Manage the system user information
 *
 */
 
/* @author mlapierre
 * $Id: client.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _ID = require("./manifest.json").namespace,
	LOCALE_PATH = 'resources/locale';

/*
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Return the current locale
	 * @return {String} The locale string
	 */
	get: function() {
		return window.webworks.execSync(_ID, 'get');
	},
	
	/**
	 * Set the current locale
	 * @param {String} locale The locale string
	 */
	set: function(locale) {
		window.webworks.execSync(_ID, 'set', { locale: locale });
	},
	
	/**
	 * Return the current locale data
	 * @return {Object} The locale data object as specified in the locale file
	 */
	getData: function() {
		return window.webworks.execSync(_ID, 'getData');
	},
};

//listen for locale changes and react as necessary
window.webworks.event.add('blackberry.event', 'localeevent', 
	function(event) {
		if (event && event.locale) {
			//swap the style definitions
			var filename = LOCALE_PATH + "/" + event.locale + "/locale.css";
			var localeCSS = document.getElementById('qnxcar-locale-css');
			if (localeCSS) {
				localeCSS.href = filename;
			} else {
				var cssNode = document.createElement("link");
				cssNode.setAttribute("rel", "stylesheet");
				cssNode.setAttribute("type", "text/css");
				cssNode.setAttribute("id", "qnxcar-locale-css");
				cssNode.setAttribute("href", filename);
				document.getElementsByTagName("head")[0].appendChild(cssNode);		
			}
		}
	}
);