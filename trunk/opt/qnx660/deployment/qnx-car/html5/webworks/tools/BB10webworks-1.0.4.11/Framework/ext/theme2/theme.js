/**
 * The abstraction layer for user functionality
 *
 * @author mlapierre
 * $Id: theme.js 4596 2012-10-12 16:01:36Z edagenais@lixar.com $
 */

var	_pps = require('../../lib/pps/ppsUtils'),
	_profileThemeReaderPPS,
	_trigger,
	_themeUpdateTrigger;

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Initializes the extension 
	 */
	init: function() {
		_themesReaderPPS = _pps.createObject();
		_themesReaderPPS.init();
		_themesReaderPPS.open("/pps/qnxcar/themes", JNEXT.PPS_RDONLY);

		_profileThemeReaderPPS = _pps.createObject();
		_profileThemeReaderPPS.init();
		_profileThemeReaderPPS.onChange = function(event) {
			if (_trigger && event && event.data) {
				_trigger({ theme: event.data });
			}
		};
		_profileThemeReaderPPS.open("/pps/qnxcar/profile/theme", JNEXT.PPS_RDONLY);

		_profileThemeWriterPPS = _pps.createObject();
		_profileThemeWriterPPS.init();
		_profileThemeWriterPPS.open("/pps/qnxcar/profile/theme", JNEXT.PPS_WRONLY);
	},

	/**
	 * Sets the trigger function to call when an event is fired
	 * @param trigger {Function} The trigger function to call when an event is fired
	 */
	setTrigger: function(trigger) {
		_trigger = trigger;
	},

	/**
	 * Sets the trigger function to call when an event is fired
	 * @param trigger {Function} The trigger function to call when an event is fired
	 */
	setThemeUpdateTrigger: function(trigger) {
		_themeUpdateTrigger = trigger;
	},
	

	/**
	 * Returns a list of available themes
	 * @returns {Object} A list of available themes
	 * Ex:	{
	 *			"default": {
	 *				"id": "default",
	 *				"title": "Default",
	 *			},
	 *			"jeep": {
	 *				"id": "jeep",
	 *				"title": "Jeep Theme",
	 *			}
	 *		}
	 */
	getList: function() {
		return _themesReaderPPS.ppsObj;
	},
	
	/**
	 * Returns the current theme
	 * @returns {String} The current theme id
	 */
	getActive: function() {
		return _profileThemeReaderPPS.ppsObj.theme;
	},
	
	/**
	 * Sets the current theme
	 * @param theme {String} The new theme id
	 */
	setActive: function(theme) {
		if (typeof theme === "string" && theme.length > 0) {
			_profileThemeWriterPPS.write({
				theme: theme
			});
		}
	}
};