/**
* The abstraction layer for media source management
 *
 * @author mlapierre
 * $Id: mediasource.js 4326 2012-09-27 17:43:24Z mlapierre@qnx.com $
 */

var	_pps = require('../../lib/pps/ppsUtils'),
	_statusPPS,
	_sources,
	_db,
	_updateTrigger,
	_addedTrigger,
	_removedTrigger;

/**
 * Called when there is a change in the status object
 * @param event {Object} The PPS data of the onChange event 
 */
function onStatusChange(event) {
	if (event == null) {
		return;
	}
	if (event.changed) {
		//new item(s) inserted
		for (var i in event.data) {
			addSource(i, event.data[i]);
		}
	}
	
	if (event.remove) {
		//media source(s) removed
		for (var i in event.remove) {
			removeSource(i);
		}
	}
}

/**
 * Adds or updates a media source
 * @param id {String} The id of the media source
 * @param source {Object} The PPS media source object
 */
function addSource(id, source) {
	_sources[id] = {
		id: id,
		name: (source.name && source.name.length > 0) ? source.name : 'Unnamed',
		type: source.device_type,
		fs: source.fs_type,
		db: source.dbpath,
		mount: source.mount,
		synched: source.synched,
		imagePath: source.image_path,
	};
	
	if (_addedTrigger) {
		_addedTrigger(_sources[id]);
	}
};

/**
 * Removes a media source
 * @param id {String} The id of the media source
 */
function removeSource(id) {
	if (_db[id]) {
		_db[id].close();
		delete db[id];
	}
	delete _sources[id];

	if (_removedTrigger) {
		_removedTrigger({ id: id });
	}
};

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Initializes the extension 
	 */
	init: function() {
		_sources = {};
		_db = {};
		
		_statusPPS = new JNEXT.PPS();
		_statusPPS.init();
		_statusPPS.onChange = onStatusChange;
		_statusPPS.onReady = function(data) {
			for (var i in _statusPPS.ppsObj) {
				addSource(i, _statusPPS.ppsObj[i]);
			}
		};
		_statusPPS.open("/pps/services/mm-detect/status", JNEXT.PPS_RDONLY);		
	},
	
	/**
	 * Sets the trigger function to call when a media source update event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setUpdateTrigger: function(trigger) {
		_updateTrigger = trigger;
	},

	/**
	 * Sets the trigger function to call when a media source added event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setAddedTrigger: function(trigger) {
		_addedTrigger = trigger;
	},
	
	/**
	 * Sets the trigger function to call when a media source removed event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setRemovedTrigger: function(trigger) {
		_removedTrigger = trigger;
	},
	
	/**
	 * Returns an array of media sources
	 * @return {Array} An array of media source objects
	 */
	get: function() {
		return _sources;
	},
};
