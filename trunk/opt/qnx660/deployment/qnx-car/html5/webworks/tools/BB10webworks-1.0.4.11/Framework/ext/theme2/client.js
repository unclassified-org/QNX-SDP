/**
 * @module qnx_xyz_theme
 * @description Manages theming
 * @author mlapierre
 * $Id: client.js 4596 2012-10-12 16:01:36Z edagenais@lixar.com $
 * @deprecated Please use car.theme instead.
 */

var _ID = require("./manifest.json").namespace;

function loadTheme(theme) {
 	//verify that this application is themeable
 	var styleNode = document.getElementById('theme-css');
 	if (styleNode) {
 		//find the name of the application
 		var app = styleNode.getAttribute('app');

 		//find the current theme
 		var activeTheme = (theme && theme.id) ? theme : window.webworks.execSync(_ID, 'getActive');

 		//determing the CSS file for the application
		var themeCSS = 'platform:///apps/common/themes/' + activeTheme + '/' + app + '/master.css';

 		//apply the theme only if it is different than the current theme
 		if (styleNode.getAttribute('href') !== themeCSS) {
	 		styleNode.setAttribute('href', themeCSS);
 		}
 	}
 }

/*
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Return a list of available themes
	 * @returns {Object} A list of available themes
	 * @example
	 *{
	 *     "default": {
	 *         "id": "default",
	 *         "title": "Default",
	 *     },
	 *     "jeep": {
	 *         "id": "jeep",
	 *         "title": "Jeep Theme",
	 *     }
	 *}
	 */
	getList: function() {
		return window.webworks.execSync(_ID, 'getList');
	},

	/**
	 * Return the current theme
	 * @returns {String} The current theme ID
	 */
	getActive: function() {
		return window.webworks.execSync(_ID, 'getActive');
	},
	
	/**
	 * Set the current theme
	 * @param {String} theme The new theme ID
	 */
	setActive: function(theme) {
		return window.webworks.execAsync(_ID, 'setActive', { theme: theme });
	}
};

// Listen for theme changes and react as necessary
window.webworks.event.add('blackberry.event', 'themeupdate', loadTheme);

//Initialize theme client if the DOM has been loaded, otherwise defer initialization until then
if (!document.body) {
	document.addEventListener('DOMContentLoaded', loadTheme);
} else {
	loadTheme();
}