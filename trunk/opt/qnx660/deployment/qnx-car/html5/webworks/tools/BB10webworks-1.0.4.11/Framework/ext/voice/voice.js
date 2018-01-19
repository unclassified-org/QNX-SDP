/**
 * The abstraction layer for voice functionality
 *
 * @author mlapierre
 * $Id: voice.js 4280 2012-09-25 19:22:34Z dkerr@qnx.com $
 */

var _pps = require('../../lib/pps/ppsUtils'),
	_readerPPS,
	_writerPPS,
	_appListPPS,
	_stateTrigger,
	_resultTrigger,
	_handledTrigger;

/**
 * Called when there is a change in the asr control object
 * @param event {Object} The PPS data of the onChange event 
 */
function onAsrChange(event) {
	if (_stateTrigger && event && event.data && event.data.state) {
		_stateTrigger({ state: event.data.state });
	}
	if (_resultTrigger && event && event.data && event.data.result) {
		_resultTrigger({ result: event.data.result });
	}
	if (_handledTrigger && event && event.data && event.data.speech) {
		_handledTrigger({ handled: event.data.speech });
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
		_readerPPS.onChange = onAsrChange;
		_readerPPS.open("/pps/services/asr/control", JNEXT.PPS_RDONLY);

		//writerPPS
		_writerPPS = _pps.createObject();
		_writerPPS.init();
		_writerPPS.open("/pps/services/asr/control", JNEXT.PPS_WRONLY);

		//the list of tabs & apps available to asr is written to this object
		_appListPPS = _pps.createObject();
		_appListPPS.init();
		_appListPPS.open("/pps/services/app-launcher", JNEXT.PPS_RDWR);

	},
	
	/**
	 * Sets the trigger function to call when a state event is fired
	 * @param trigger {Function} The trigger function to call when an event is fired
	 */
	setStateTrigger: function(trigger) {
		_stateTrigger = trigger;
	},
	
	/**
	 * Sets the trigger function to call when a result event is fired
	 * @param trigger {Function} The trigger function to call when an event is fired
	 */
	setResultTrigger: function(trigger) {
		_resultTrigger = trigger;
	},
	
	/**
	 * Sets the trigger function to call when a result event is fired
	 * @param trigger {Function} The trigger function to call when an event is fired
	 */
	setHandledTrigger: function(trigger) {
		_handledTrigger = trigger;
	},

	/**
	 * Tells the system to listen for a voice command
	 */
	listen: function() {
		switch (_readerPPS.ppsObj.state) {
			case 'idle':
				_writerPPS.write({ strobe: 'on' });
				break;
			case 'prompting':
				_writerPPS.write({ strobe: 'barge-in' });
				break;
		}
	},
	
	/**
	 * Tells the system that you are finished saying your voice command
	 */
	stopListening: function() {
		if (_readerPPS.ppsObj.state == 'listening') {
			_writerPPS.write({ strobe: 'mic-off' });
		}
	},
	
	/**
	 * Tells the system to cancel voice recognition in progress
	 */
	cancel: function() {
		_writerPPS.write({ strobe: 'off' });
	},
	
	/**
	 * Say a string using text-to-speech
	 * @param text {String} The string to say
	 */
	say: function(text) {
		_writerPPS.write({ strobe: 'tts://' + text });
	},

	/**
	 * Informs the system of the available applications it can launch
	 * @param list {Array} The list of applications
	 */
	setList: function(listObj) {
		_appListPPS.write(listObj);
	},

	/**
	 * Informs the system of the available applications it can launch
	 * @param list {Array} The list of applications
	 */
	addItem: function(item) {
		_appListPPS.read();
		var listObj = {app_list: _appListPPS.ppsObj.app_list.concat(item)};
		_appListPPS.write(listObj);
	},

	/**
	 * Retrieves the state of the voice req service
	 * @return {String} The state of the voice req service
	 * Ex. possible values: 'idle', 'prompting', 'listening', 'processing'
	 */
	getState: function() {
		_readerPPS.read();
		return _readerPPS.ppsObj.state;
	},

	/**
	 * Retrieves the state of the speech attribute
	 * @return {String} The state of the speech attribute
	 * Ex. possible values: 'processing', 'handled'
	 */
	getSpeechState: function() {
		_readerPPS.read();
		return _readerPPS.ppsObj.speech;
	}

};
