/**
 * The abstraction layer for user functionality
 *
 * @author mlapierre
 * $Id: theme.js 4596 2012-10-12 16:01:36Z edagenais@lixar.com $
 */

var	_pps = require('../../lib/pps/ppsUtils'),
	_themesReaderPPS,
	_profileThemeReaderPPS,
	_profileThemeWriterPPS,
	_triggerUpdate;

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
			if (_triggerUpdate && event && event.data) {
				_triggerUpdate(this.getActive());
			}
		}.bind(this);
		_profileThemeReaderPPS.open("/pps/qnxcar/profile/theme", JNEXT.PPS_RDONLY);

		_profileThemeWriterPPS = _pps.createObject();
		_profileThemeWriterPPS.init();
		_profileThemeWriterPPS.open("/pps/qnxcar/profile/theme", JNEXT.PPS_WRONLY);
	},

	/**
	 * Sets the trigger function to call when an update event is fired
	 * @param {Function} trigger The trigger function to call when the event is fired
	 */
	setTriggerUpdate: function(trigger) {
		_triggerUpdate = trigger;
	},

	/**
	 * Returns a list of available themes
	 * @returns {Array} A list of available themes
	 */
	getList: function() {
		var list = [];
		var keys = Object.keys(_themesReaderPPS.ppsObj)
		for (var i=0; i<keys.length; i++) {
			list.push({ id: keys[i], name: _themesReaderPPS.ppsObj[keys[i]].title });
		}
		return list;
	},
	
	/**
	 * Returns the current theme
	 * @returns {Object} The current theme
	 */
	getActive: function() {
		var id = _profileThemeReaderPPS.ppsObj.theme;
		var name = _themesReaderPPS.ppsObj[id].title;
		return { id: id, name: name };
	},
	
	/**
	 * Sets the current theme
	 * @param {String} themeId The new theme id
	 */
	setActive: function(themeId) {
		if (typeof themeId === "string" && themeId.length > 0) {
			_profileThemeWriterPPS.write({
				theme: themeId
			});
		}
	}
};