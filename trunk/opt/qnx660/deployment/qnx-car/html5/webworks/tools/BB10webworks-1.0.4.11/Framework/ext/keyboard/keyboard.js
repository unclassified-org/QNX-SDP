/**
 * The abstraction layer for keyboard functionality
 *
 * @author mlapierre
 * $Id: keyboard.js 4348 2012-09-28 18:05:29Z mlytvynyuk@qnx.com $
 */

var	_pps = require('../../lib/pps/ppsUtils'),
	_readerPPS,
	_writerPPS,
	_trigger;

/**
 * Method called when the keyboard PPS data changes
 * @param event {Object} The pps data for the event
 */
function onKeyboardEvent(event) {
	if (_trigger && event && event.changed && event.changed.visible) {
		_trigger({ visible: event.data.visible });
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
		_readerPPS.onChange = onKeyboardEvent;
		_readerPPS.open("/pps/system/keyboard/status", JNEXT.PPS_RDONLY);

		//writerPPS
		_writerPPS = _pps.createObject();
		_writerPPS.init();
		_writerPPS.open("/pps/system/keyboard/control", JNEXT.PPS_WRONLY);
	},
	
	/**
	 * Sets the trigger function to call when an event is fired
	 * @param trigger {Function} The trigger function to call when an event is fired
	 */
	setTrigger: function(trigger) {
		_trigger = trigger;
	},
	
	/**
	 * Shows the keyboard
	 */
	show: function() {
		_writerPPS.write({ msg: 'show' });
	},
	
	/**
	 * Hides the keybaord
	 */
	hide: function() {
		_writerPPS.write({ msg: 'hide' });
	},
	
	/**
	 * Returns the state of the keyboard
	 * @returns {Object} The state of the keyboard
	 * Ex: {
	 *     visible: {Boolean}				// true if keyboard visible
	 * }
	 */
	getState: function() {
		return {
			visible: _readerPPS.ppsObj.visible,
		}
	}
};
