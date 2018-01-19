/**
 * The abstraction layer for boot manager
 *
 * @author dkerr
 * $Id:$
 */

var _pps = require('../../lib/pps/ppsUtils'),
	_moduleReadyPPS,
	_historyPPS,
	_modulesReady,
	_launcherReady = false,
	_responseTrigger;

/* A new array class that creates events when items are pushed onto the array
 * Bootmgr modules will be added by 'push' and removed by 'shift'. (FIFO)
 */
function EventedArray(handler) {
	this.stack = [];
	this.mutationHandler = handler || function() {};
	this.setHandler = function(f) {
		this.mutationHandler = f;
	};
	this.push = function(obj) {
		this.stack.push(obj);
		this.mutationHandler(obj);
	};
	this.shift = function() {
		var obj = this.stack.shift();
		return obj;
	};
	this.getArray = function() {
		return this.stack;
	}
}

/* Method called when the bootmgr object creates an object in the modules_ready/ folder.  
 * This method is also called for each existing object when the folder is opened with '.all' option.
 * The contents of modules_ready/ will be added in order of arrival. 
 * @param event {Object} The PPS event
 */
function onModuleReady(event) {
	if (event && event.objName) {
		_modulesReady.push(event.objName); 
	}
}

/* Handler for EventedArray events.  This will only event on 
 * i) 'launcher' module added 
 * ii) 'launcher' has been added AND the application has signaled a start AND the queue has 1 element.
*/
function moduleHandler(obj) {
	if (obj === 'launcher') {
		_launcherReady = true;
		if (_responseTrigger) {
			_responseTrigger(obj);			
		}
	} else {
		if (_launcherReady) {
			if (_responseTrigger && obj) {
				_responseTrigger(obj);
			}
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

		_moduleReadyPPS = _pps.createObject();
		_moduleReadyPPS.init();
		_moduleReadyPPS.onReady = onModuleReady;
		_moduleReadyPPS.onChange = onModuleReady;
		_moduleReadyPPS.open("/pps/services/bootmgr/modules_ready/.all", JNEXT.PPS_RDONLY);

		_historyPPS = _pps.createObject();
		_historyPPS.init();
		_historyPPS.open("/pps/services/bootmgr/history", JNEXT.PPS_RDWR);

		_modulesReady = new EventedArray();
		_modulesReady.setHandler(moduleHandler);
	},

	/**
	 * Retrieves the list of objects present when the '.all' object was opened
	 */
	getModules: function () {
		return _modulesReady;
	},

	/**
	 * Sets the trigger function to call when a bootmgr response is received
	 * @param trigger {Function} The trigger function to call when the response is received
	 */
	setResponseTrigger: function(trigger) {
		_responseTrigger = trigger;
	},

	/**
	 * Writes the appId of the last tab to the history object
	 * @param appId {String} The trigger function to call when the response is received
	 */
	setLastTab: function(appId) {
		_historyPPS.write({last_tab:appId});
	},	

	/**
	 * Retrieves the status of the bootmgr launcher
	 * @returns {Boolean} 
	 */
	isLauncherReady: function() {
		return _launcherReady;
	},

	/**
	 * Retrieves the next bootmgr module from the EventedArray FIFO
	 * @returns {String} The next module string from the bootmgr
	 */
	getNextModule: function() {
		return _modulesReady.shift();
	},

	/**
	 * Reads the appId of the last tab from the history object
	 * @param appId {String} The trigger function to call when the response is received
	 */
	getLastTab: function() {
		var appId = null;

		_historyPPS.read();
		if (_historyPPS.ppsObj) {
			appId = (typeof _historyPPS.ppsObj.last_tab !== "undefined") ? _historyPPS.ppsObj.last_tab : null;
		} 
		
		return appId;
	}	
};
