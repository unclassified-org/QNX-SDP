/**
 * @module qnx_xyz_theme
 * @description Manages theming
 *
 */

/* 
 * @author mlapierre
 * $Id: client.js 4596 2012-10-12 16:01:36Z edagenais@lixar.com $
 */

var _ID = require("./manifest.json").namespace,
	_LAZY_LOADER = require("./lazyLoader");

var APPLICATION_NAME = window.themerApplicationName;
var PRIMARY_THEME_ASSET_ID = "themeStyleAsset";
var STYLESHEET_NAME = "master.css";
var APPLICATION_DEFAULT_STYLE_PATH = "";
var STYLESHEET_FULL_PATH = "";
var BASE_THEME_DIR_PATH = "platform:///apps/common/themes";
var PREVIOUS_THEME = "";
var EVENT_UI_UPDATE_COMPLETE = "themeuiupdatecomplete";

/*
 * Initializes the theme client.
 */
function initialize() {
	// Get the primary theme CSS element
	var themeAsset = document.querySelector("#" + PRIMARY_THEME_ASSET_ID);
	
	if(themeAsset) {
		// The initial href value of the themer asset defines the default stylesheet
		APPLICATION_DEFAULT_STYLE_PATH = themeAsset.getAttribute('href');
	} else {
		console.info(_ID + ":client.js - Primary theme asset with ID " + PRIMARY_THEME_ASSET_ID + " does not exist.");
	}
	
	// Force the application to theme on startup
	resetThemeCSS();
}

/*
 * Set the correct theme to display on the UI
 */
function resetThemeCSS() {
	try {
		// If a name for the application has been defined
		if(typeof APPLICATION_NAME !== "undefined") {
			var currentTheme = window.webworks.execSync(_ID, 'getActive'),	// Get the current theme object from PPS
				themesList = window.webworks.execSync(_ID, 'getList');		// List of available themes

			// Ensure that the previous theme is not the same as the one being implemented - if it is, skip this process
			if(PREVIOUS_THEME !== currentTheme) {
				// Determine whether the theme requested in the PPS matches an available theme package
				var themeObj = themesList[currentTheme];

				// If the theme requested in the PPS exists in the list of themes
				if(typeof themeObj === "object") {
					// If the application exists in the list of themable applications
					if(currentTheme !== "default") {
						// Define the full path of the file to include in the application
						STYLESHEET_FULL_PATH = BASE_THEME_DIR_PATH + "/" + currentTheme + "/day/" +  APPLICATION_NAME + "/" + STYLESHEET_NAME;
					} else {
						// Revert to the original href value in the themer asset
						STYLESHEET_FULL_PATH = APPLICATION_DEFAULT_STYLE_PATH;
					}

					// Lazy load the theme CSS file
					processStylesheet(STYLESHEET_FULL_PATH);

					// Retain the name of the currently selected theme so that the next time the theme is changed, the logic
					// is not re-applied if the actual theme has not changed.
					PREVIOUS_THEME = currentTheme;
				}
			} else {
				console.warn(_ID + ":client.js - The theme requested '" + currentTheme + "' is already loaded for application: " + APPLICATION_NAME);
			}
		} else {
			console.warn(_ID + ":client.js - window.themerApplicationName has not been set")
		}
	} catch(err) {
		console.error(_ID + ":client.js - resetThemeCSS()", err);
	}
}

/*
 * Function processes defined stylehsheet and provides callbacks procedures once the stylesheet is done
 * being loaded and processed within the DOM.
 */
function processStylesheet(stylesheetFullPath) {
	// Lazy load the CSS file
	_LAZY_LOADER.LazyLoad.css(APPLICATION_NAME, stylesheetFullPath, PRIMARY_THEME_ASSET_ID, function(e) {
		// Trigger a reflow on the document forcing the DOM to recalculate the dimensions
		// of all elements
		document.body.offsetWidth = document.body.offsetWidth;
		// Dispatch a theme change event
		webworks.event.trigger(EVENT_UI_UPDATE_COMPLETE);
	});
}

/*
 * Function dynamically includes the theming configurations
 * @param {String} filename Name of the JSON file to include
 * @param {String} filepath Path of the JSON file to include
 */
function jsonInclude(filename, filepath) {
	var ajaxRequest = new XMLHttpRequest();
	var ajaxResponse = {};
	filepath = filepath || BASE_THEME_DIR_PATH; // set a default value if param is not provided

	ajaxRequest.open("GET", filepath + "/" + filename + "?" + (new Date().getDate()), false);
	ajaxRequest.send();

	try {
		ajaxResponse = JSON.parse(ajaxRequest.responseText);
	} catch(e) {
		console.error(_ID + ":client.js - Improper JSON syntax", ajaxRequest.responseText);
	}
	
	return ajaxResponse;
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
	 *     "default":  {
	 *         "ppsName": "default",
	 *         "title": "Default",
	 *         "themePackageName": "default",
	 *         "packageDate": "2012-04-23"
	 *                 },
	 *     "jeep":     {
	 *         "ppsName": "jeep",
	 *         "title": "Jeep Theme",
	 *         "themePackageName": "jeep",
	 *         "packageDate": "2012-04-13"
	 *                 }
	 *}
	 */
	getList: function() {
		return window.webworks.execSync(_ID, 'getList');
	},

	/**
	 * Return the file path of the master stylesheet of the application relative to platform
	 * @returns {String} File path of the master stylesheet of the application
	 */
	getStylesheetFullPath: function() {
		return STYLESHEET_FULL_PATH;
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
window.webworks.event.add('blackberry.event', 'themeupdate', 
	function(event) {
		if (event) {
			//check for a theme change
			if (event.theme || typeof event.nightMode == 'boolean') {
				resetThemeCSS();
			}
		}
	}
);

//Initialize theme client if the DOM has been loaded, otherwise defer initialization until then
if(!document.body) {
	console.log(_ID + ':client.js - ' + APPLICATION_NAME + ' DOM content not fully loaded, deferring initialization');
	document.addEventListener('DOMContentLoaded', initialize);
} else {
	initialize();
}