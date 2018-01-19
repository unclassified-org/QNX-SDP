/**
 * The abstraction layer for radio functionality.
 *
 * @author lgreenway
 * $Id: radio.js 4577 2012-10-11 19:18:08Z lgreenway@qnx.com $
 */

var	_pps = require('../../lib/pps/ppsUtils'),
	_tunersPPS,
	_statusPPS,
	_statusWriterPPS,
	_commandPPS,
	_metadataChangedTrigger,
	_presetsChangedTrigger,
	_tunerChangedTrigger,
	_stationChangedTrigger,
	_simulationScanTimer,
	SIMULATION_MODE = true;

/**
 * Get the current station metadata.
 * @return {Object} A station metadata object.
 * Ex:
 * 
 * {
 * 	tuner: 'fm',
 * 	station: 91.5,
 * 	artist: 'Bjork',
 * 	genre: 'News & Entertainment',
 * 	song: 'All is Full of Love',
 * 	stationName: 'CBC Radio 1',
 * 	hd: false
 * }
 */
function getMetadata() {
	var status = _statusPPS.ppsObj;
	
	return {
		tuner		: status.tuner,
		station 	: status[status.tuner].station,
		artist		: status.artist,
		genre		: status.genre,
		song		: status.song,
		stationName	: status.station,
		hd			: status.hd
	};
}

/**
 * Radio status PPS object change handler. Responsible for firing
 * the extension events.
 * @param event {Event} The PPS change event
 */
function onRadioEvent(event) {
	// If station metadata has changed, fire a metadataChanged event
	if (_metadataChangedTrigger && event && event.data &&
			(event.data.artist ||
			event.data.genre ||
			(typeof(event.data.hd) != 'undefined' && event.data.hd != null) ||
			event.data.song ||
			event.data.station)) {
		
		_metadataChangedTrigger(getMetadata());
	}
	
	// If presets/station have changed, fire presetsChanged event
	if (_presetsChangedTrigger && event && event.data) {
		var presets = {};
		// If either of the tuner preset/station objects has changed
		for(var tuner in _tunersPPS.ppsObj) {
			if(event.data[tuner]) {
				presets[tuner] = event.data[tuner].presets;
			}
		}
		
		if(Object.keys(presets).length) {
			_presetsChangedTrigger(presets);
		}
	}

	// If tuner attribute has changed, fire tunerChanged event
	if (_tunerChangedTrigger && event && event.data && event.data.tuner) {
		_tunerChangedTrigger(event.data.tuner);
	}
	
	// If presets/station have changed, fire stationChanged event
	if (_stationChangedTrigger && event && event.data) {
		var stations = {};
		// If either of the tuner preset/station objects has changed
		for(var tuner in _tunersPPS.ppsObj) {
			if(event.data[tuner]) {
				stations[tuner] = event.data[tuner].station;
			}
		}
		
		if(Object.keys(stations).length) {
			_stationChangedTrigger(stations);
		}
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
		//_tunersPPS
		_tunersPPS = _pps.createObject();
		_tunersPPS.init();
		_tunersPPS.open("/pps/radio/tuners", JNEXT.PPS_RDONLY);
		
		//_statusPPS
		_statusPPS = _pps.createObject();
		_statusPPS.init();
		_statusPPS.onChange = onRadioEvent;
		_statusPPS.open("/pps/radio/status", JNEXT.PPS_RDONLY);
		
		//writing pps commands
		_commandPPS = _pps.createObject();
		_commandPPS.init();
		if (SIMULATION_MODE)
		{
			_commandPPS.open("/pps/radio/status", JNEXT.PPS_WRONLY);
		}
		else
		{
			_commandPPS.open("/pps/radio/command", JNEXT.PPS_WRONLY);
		}

		//status writer, used to save presets
		_statusWriterPPS = _pps.createObject();
		_statusWriterPPS.init();
		_statusWriterPPS.open("/pps/radio/status", JNEXT.PPS_WRONLY);
	},
	
	/**
	 * Sets the trigger function to call when an event is fired
	 * @param trigger {Function} The trigger function to call when an event is fired
	 */
	setMetadataChangedTrigger: function(trigger) {
		_metadataChangedTrigger = trigger;
	},
	
	/**
	 * Sets the trigger function to call when an event is fired
	 * @param trigger {Function} The trigger function to call when an event is fired
	 */
	setPresetsChangedTrigger: function(trigger) {
		_presetsChangedTrigger = trigger;
	},
	
	/**
	 * Sets the trigger function to call when an event is fired
	 * @param trigger {Function} The trigger function to call when an event is fired
	 */
	setTunerChangedTrigger: function(trigger) {
		_tunerChangedTrigger = trigger;
	},
	
	/**
	 * Sets the trigger function to call when an event is fired
	 * @param trigger {Function} The trigger function to call when an event is fired
	 */
	setStationChangedTrigger: function(trigger) {
		_stationChangedTrigger = trigger;
	},
	
	/**
	 * Returns the list of available tuners.
	 * @return {Object} An object containing attributes corresponding to each tuner object. The attribute name
	 * is the name of the tuner.
	 */
	getTuners: function() {
		return _tunersPPS.ppsObj;
	},

	/**
	 * Gets the active tuner name.
	 * @return {String} The active tuner name
	 */	
	getActiveTuner: function() {
		return _statusPPS.ppsObj.tuner;
	},

	/**
	 * Sets the active tuner by name.
	 * @param tuner {String} The name of tuner to set as active
	 */
	setTuner: function (tuner) {
		_commandPPS.write({tuner: tuner});
	},	

	/**
	 * Gets the current station for the active tuner. Optionally, if a tuner name is specified,
	 * returns the current station for the specified tuner.
	 * @param tuner {String} (optional) The station tuner.
	 * @returns {Number} The current station.
	 */
	getStation: function(tuner) {
		return tuner ? _statusPPS.ppsObj[tuner].station : _statusPPS.ppsObj[_statusPPS.ppsObj.tuner].station;
	},
	
	/**
	 * Tune to a specific station, optionally targeting a specific tuner. If the specified
	 * tuner is not the active tuner, then the station will be automatically selected the next
	 * time that tuner is set as active.
	 * @param station {Number} The target station
	 * @param tuner {String} (optional) The target tuner name
	 */
	setStation: function(station, tuner) {
		if (SIMULATION_MODE) {
			var obj = {};
			obj[tuner || _statusPPS.ppsObj.tuner] = _statusPPS.ppsObj[tuner || _statusPPS.ppsObj.tuner];
			obj[tuner || _statusPPS.ppsObj.tuner].station = station;
			
			_commandPPS.write(obj);
		} else {
			// If the station is not for the active tuner, then write the selected station
			// directly to the status PPS object since nothing needs to happen at the radio
			// service level.
			if(tuner != _statusPPS.ppsObj.tuner) {
				var obj = {};
				obj[tuner] = _statusPPS.ppsObj[tuner];
				obj[tuner].station = station;

				_statusWriterPPS.write(obj);
			}
			
			// If the station is for the current tuner, then send the tune command to the command PPS
			_commandPPS.write({ tune: station });
		}
	},
	
	/**
	 * Get the presets for the current tuner. Optionally, a tuner name can be specified, returning
	 * presets for the specified tuner.
	 * @param tuner {String} (optional) The tuner of the presets 
	 * @return {Object} An object containing an attribute corresponding to the tuner name
	 * with its associated preset list.
	 * Ex:
	 * 
	 * {
	 * 	fm: [87.9, 91.5, 95.1, 103.4, 105.1, 107.1]
	 * }
	 */
	getPresets: function(tuner) {
		var presets = {};
		presets[tuner || _statusPPS.ppsObj.tuner] = _statusPPS.ppsObj[tuner || _statusPPS.ppsObj.tuner].presets;
		return presets;
	},
	
	/**
	 * Sets the entire list of presets for the specified tuner(s).
	 * @param presets {Object} An object containing one or more tuner preset lists.
	 */
	setPresets: function(presets) {
		var obj = {};
		
		for(var tuner in presets) {
			if(_statusPPS.ppsObj[tuner]) {
				obj[tuner] = _statusPPS.ppsObj[tuner];
				obj[tuner].presets = presets[tuner];
			} else {
				console.warn('Unknown tuner: ' + tuner);
			}
		}
		
		_statusWriterPPS.write(obj);
	},
	
	/**
	 * Sets the current station as a preset at the specified index. A station and tuner can optionally
	 * be specified to set the non-current station as a preset, and/or for the non-active tuner. 
	 * @param index {Number} The preset index
	 * @param station {Number} (optional) The station to set as the preset. If not specified, the current station will be used.
	 * @param tuner {String} (optional) The station's tuner. If not specified, the active tuner will be used.
	 */
	setPreset: function(index, station, tuner) {
		var obj = {};
		obj[tuner || _statusPPS.ppsObj.tuner] = _statusPPS.ppsObj[tuner || _statusPPS.ppsObj.tuner];
		obj[tuner || _statusPPS.ppsObj.tuner].presets[index] = station || obj[tuner || _statusPPS.ppsObj.tuner].station;
		
		// TODO: Ensure station preset is within the range of the specified tuner
		
		_statusWriterPPS.write(obj);
	},
	
	/**
	 * Seek for the next radio station in the given direction
	 * @param direction {String} The direction to seek ('up' or 'down')
	 */
	seek: function(direction) {
		if (SIMULATION_MODE) {
			var tuner = _tunersPPS.ppsObj[_statusPPS.ppsObj.tuner];
			
			var numSteps = (tuner.rangeMax - tuner.rangeMin) / tuner.rangeStep;
			var rand = Math.ceil(Math.random() / 5 * numSteps);
			if (direction == 'down') {
				rand = -rand;
			}
			
			var currStation = parseFloat(_statusPPS.ppsObj[_statusPPS.ppsObj.tuner].station);
			var targetStation = currStation + (rand  * tuner.rangeStep);
			if (targetStation < tuner.rangeMin)
			{
				targetStation = tuner.rangeMax - (tuner.rangeMin - targetStation);
			}
			else if (targetStation > tuner.rangeMax)
			{
				targetStation = tuner.rangeMin + (targetStation - tuner.rangeMax);
			}
			
			//ensure proper number of decimals
			var strStation = new String(currStation)
			var decpos = strStation.indexOf('.');
			if (decpos > -1) {
				targetStation = new Number(targetStation + '').toFixed(strStation.length - decpos - 1);
			}
			
			this.setStation(targetStation);
		} else {
			_commandPPS.write({ seek: direction });
		}
	},
	
	/**
	 * Scan for available radio stations in the given direction.
	 * @param direction {String} The direction to scan ('up' or 'down')
	 */
	scan: function(direction) {
		if (_simulationScanTimer !== undefined)
		{
			clearInterval(_simulationScanTimer);
		}

		var self = this;
		if (direction == 'up')
		{
			_simulationScanTimer = setInterval(function() { self.seek("up") }, 3000);
			this.seek("up");
		}
		else if (direction == 'down')
		{
			_simulationScanTimer = setInterval(function() { self.seek("down") }, 3000);
			this.seek("down");
		}
	},
	
	/**
	 * Stop station scanning if in progress.
	 */
	scanStop: function() {
		if(_simulationScanTimer !== undefined)
		{
			clearInterval(_simulationScanTimer);
		}
		
		//get the server side to stop seeking in the middle of a seek.
		if (!SIMULATION_MODE) {
			_commandPPS.write({ seek: "stop" });
		}
	},
	
	/**
	 * Get the current station metadata.
	 * @return {Object} A station metadata object.
	 */
	getMetadata: function() {
		return getMetadata();
	},
};
