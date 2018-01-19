/**
 * The abstraction layer for radio functionality.
 *
 * @author mlapierre
 * $Id: radio.js 4577 2012-10-11 19:18:08Z lgreenway@qnx.com $
 */

var	_pps = require('../../lib/pps/ppsUtils'),
	_tunersPPS,
	_statusPPS,
	_statusWriterPPS,
	_commandPPS,
	_triggerUpdate,
	_triggerPresets,
	_scanTimer,
	SIMULATION_MODE = true;

/**
 * Get the current status.
 * @return {Object} A radio status object.
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
function getStatus() {
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
 * Returns the list of available tuners.
 * @return {Object} An object containing attributes corresponding to each tuner object. The attribute name
 * is the name of the tuner.
 */
function getTuners() {
	var tuners = [];
	var keys = Object.keys(_tunersPPS.ppsObj);
	for (var i=0; i<keys.length; i++) {
		var tuner = {
			tuner: keys[i],
			type: _tunersPPS.ppsObj[keys[i]].type
		}
		switch (tuner.type) {
			case 'analog': 
				tuner.settings = {
					rangeMin: _tunersPPS.ppsObj[keys[i]].rangeMin,
					rangeMax: _tunersPPS.ppsObj[keys[i]].rangeMax,
					rangeStep: _tunersPPS.ppsObj[keys[i]].rangeStep,
				};
				break;

			default:
				console.error('car.radio::getTuners: Unknown tuner type: ' + tuner.type);
				continue;
		}
		tuners.push(tuner);
	}
	return tuners;
};

/**
 * Get the presets for the current tuner. Optionally, a tuner name can be specified, returning
 * presets for the specified tuner.
 * @param {String} tuner The tuner for the presets 
 * @return {Array} An array of presets.
 */
function getPresets(tuner) {
		var presets = [];

		var ppsPresets = _statusPPS.ppsObj[tuner].presets;
		for (var i=0; i<ppsPresets.length; i++) {
			presets.push({
				tuner: tuner,
				group: tuner + '1',
				index: i,
				station: ppsPresets[i]
			});
		}
		return presets;
};

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
		_statusPPS.onChange = function(data) {
			//status updates
			if (_triggerUpdate) {
				_triggerUpdate(getStatus());
			}
			//preset updates
			if (_triggerPresets && data && data.changed) {
				var tuners = getTuners();
				for (var i=0; i<tuners.length; i++) {
					if (typeof data.changed[tuners[i].tuner] !== 'undefined') {
					console.log('trigger')
						//possible preset change
						_triggerPresets(getPresets(tuners[i].tuner));
					}
				}
			}
		};
		_statusPPS.open("/pps/radio/status", JNEXT.PPS_RDONLY);
		
		//writing pps commands
		_commandPPS = _pps.createObject();
		_commandPPS.init();
		if (SIMULATION_MODE) {
			_commandPPS.open("/pps/radio/status", JNEXT.PPS_WRONLY);
		} else {
			_commandPPS.open("/pps/radio/command", JNEXT.PPS_WRONLY);
		}

		//status writer, used to save presets
		_statusWriterPPS = _pps.createObject();
		_statusWriterPPS.init();
		_statusWriterPPS.open("/pps/radio/status", JNEXT.PPS_WRONLY);
	},
		
	/**
	 * Sets the trigger function to call when a status event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setTriggerUpdate: function(trigger) {
		_triggerUpdate = trigger;
	},
	

	/**
	 * Sets the trigger function to call when a preset event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setTriggerPresets: function(trigger) {
		_triggerPresets = trigger;
	},
	
	/**
	 * Returns the list of available tuners.
	 * @return {Object} An object containing attributes corresponding to each tuner object. The attribute name
	 * is the name of the tuner.
	 */
	getTuners: function() {
		return getTuners();
	},

	/**
	 * Sets the active tuner by name.
	 * @param tuner {String} The name of tuner to set as active
	 */
	setTuner: function(tuner) {
		_commandPPS.write({tuner: tuner});
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
			obj[tuner] = _statusPPS.ppsObj[tuner];
			obj[tuner].station = station;
			
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
	 * @param {String} tuner The tuner for the presets 
	 * @return {Array} An array of presets.
	 */
	getPresets: function(tuner) {
		return getPresets(tuner);
	},
	
	/**
	 * Sets the current station as a preset at the specified index. A station and tuner can optionally
	 * be specified to set the non-current station as a preset, and/or for the non-active tuner. 
	 * @param index {Number} The preset index
	 * @param group {Number} The preset group
	 * @param station {Number} (optional) The station to set as the preset. If not specified, the current station will be used.
	 * @param tuner {String} (optional) The station's tuner. If not specified, the active tuner will be used.
	 */
	setPreset: function(index, group, station, tuner) {
		var obj = {};
		obj[tuner] = _statusPPS.ppsObj[tuner];
		obj[tuner].presets[index] = station;
		
		// TODO: Ensure station preset is within the range of the specified tuner
		// TODO: Handle group
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
			if (targetStation < tuner.rangeMin) {
				targetStation = tuner.rangeMax - (tuner.rangeMin - targetStation);
			} else if (targetStation > tuner.rangeMax) {
				targetStation = tuner.rangeMin + (targetStation - tuner.rangeMax);
			}
			
			//ensure proper number of decimals
			var strStation = new String(currStation)
			var decpos = strStation.indexOf('.');
			if (decpos > -1) {
				targetStation = new Number(targetStation + '').toFixed(strStation.length - decpos - 1);
			}
			
			this.setStation(targetStation, _statusPPS.ppsObj.tuner);
		} else {
			_commandPPS.write({ seek: direction });
		}
	},
	
	/**
	 * Scan for available radio stations in the given direction.
	 * @param direction {String} The direction to scan ('up' or 'down')
	 */
	scan: function(direction) {
		if (_scanTimer !== undefined) {
			clearInterval(_scanTimer);
		}

		var self = this;
		if (direction == 'up') {
			_scanTimer = setInterval(function() { self.seek("up") }, 3000);
			this.seek("up");
		} else if (direction == 'down') {
			_scanTimer = setInterval(function() { self.seek("down") }, 3000);
			this.seek("down");
		}
	},
	
	/**
	 * Stop station scanning if in progress.
	 */
	scanStop: function() {
		if(_scanTimer !== undefined) {
			clearInterval(_scanTimer);
		}
		
		//get the server side to stop seeking in the middle of a seek.
		if (!SIMULATION_MODE) {
			_commandPPS.write({ seek: "stop" });
		}
	},
	
	/**
	 * Get the current status.
	 * @return {Object} A radio status object.
	 */
	getStatus: function() {
		return getStatus();
	},
};
