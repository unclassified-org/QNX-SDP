/**
 * The abstraction layer for locale functionality
 *
 * @author mlapierre
 * $Id: locale.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var	_pps = require('../../lib/pps/ppsUtils'),
	_locale,
	_data,
	_readerPPS,
	_writerPPS,
	_trigger,
	
	LOCALE_PATH = '../resources/locale';

/**
 * Method called when the locale PPS data changes
 * @param event {Object} The pps data for the event
 */
function onLocaleChanged(event) {
	if (event && event.data && event.data.locale) {
		var req = new XMLHttpRequest();
		req.onreadystatechange = function() {
			if (req.readyState == 4 && req.status == 200) {
				var data = eval('(' + req.responseText + ')');
				if (typeof data == 'object') {
					//save the new locale
					_locale = event.data.locale;
					_data = data;

					//swap the style definitions
					if (_trigger) {
						_trigger({ locale: _locale, data: _data });
					}
				}
			}
		};
		req.open("GET", LOCALE_PATH + "/" + event.data.locale + "/locale.js", true);
		req.send();						
	}
}

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Initializes the extension 
	 */
	init: function() {
		//readerPPS
		_readerPPS = _pps.createObject();
		_readerPPS.init();
		_readerPPS.onChange = onLocaleChanged;
		_readerPPS.open("/pps/qnxcar/locale", JNEXT.PPS_RDONLY);

		//writerPPS
		_writerPPS = _pps.createObject();
		_writerPPS.init();
		_writerPPS.open("/pps/qnxcar/locale", JNEXT.PPS_WRONLY);
	},
	
	/**
	 * Sets the trigger function to call when an event is fired
	 * @param trigger {Function} The trigger function to call when an event is fired
	 */
	setTrigger: function(trigger) {
		_trigger = trigger;
	},
	
	/**
	 * Returns the current locale
	 * @return {String} The locale string
	 */
	get: function() {
		return _readerPPS.ppsObj.locale;
	},
	
	/**
	 * Sets the current locale
	 * @param locale {String} The locale string
	 */
	set: function(locale) {
		_writerPPS.write({ locale: locale });
	},
	
	/**
	 * Returns the current locale data
	 * @return {Object} The locale data object as specified in the locale file
	 */
	getData: function(user) {
		return _data;
	},
};
