/**
 * The abstraction layer for navigator utilties
 *
 * @author dkerr
 * $Id: navigator.js 4545 2012-10-09 15:55:06Z dkerr@qnx.com $
 */

var _pps = require('../../lib/pps/ppsUtils'),
	_applicationsPPS,
	_commandPPS,
	_appDataPPS,
	_statusPPS,
	_appLauncherPPS,
	_navigatorLoadedPPS,
	_startTrigger,
	_startedTrigger,
	_stopTrigger,
	_stoppedTrigger,
	_errorTrigger;

/**
 * Method called when the app-launcher object has a request
 * @param event {Object} The PPS event
 */
function onAppLauncherEvent(event) {
	if (event && event.data && event.data.req) {
		var req = event.data.req;

		if (_startTrigger) {
			if (req.cmd == "launch app") {
				if (typeof req.dat != "undefined") {
					_startTrigger({app:req.app, dat:req.dat});
				} else {
					_startTrigger({app:req.app});
				}
			}
		}
		if (_stopTrigger) {
			if (req.cmd == "close app") {
				_stopTrigger({app:req.app});
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
		_applicationsPPS = _pps.createObject();
		_applicationsPPS.init();
		_applicationsPPS.open("/pps/system/navigator/applications/applications", JNEXT.PPS_RDONLY);
		
		_commandPPS = _pps.createObject();
		_commandPPS.init();
		_commandPPS.open("/pps/system/navigator/command", JNEXT.PPS_WRONLY);
		
		_appDataPPS = _pps.createObject();
		_appDataPPS.init();
		_appDataPPS.open("/pps/system/navigator/appdata", JNEXT.PPS_RDWR_CREATE);

		_statusPPS = _pps.createObject();
		_statusPPS.init();
		_statusPPS.open("/pps/system/navigator/status/app-timestamps", JNEXT.PPS_RDWR_CREATE);

		_appLauncherPPS = _pps.createObject();
		_appLauncherPPS.init();
		_appLauncherPPS.onChange = onAppLauncherEvent;
		_appLauncherPPS.open("/pps/services/app-launcher", JNEXT.PPS_RDONLY);

		_navigatorLoadedPPS = _pps.createObject();
		_navigatorLoadedPPS.init();
        _navigatorLoadedPPS.open("/pps/system/navigator/status/navigator_loaded?n", JNEXT.PPS_RDWR_CREATE);
	},

	/**
	 * Triggers the pause event for the specified app
	 * @param name {String} The target app as specified by the id in config.xml
	 */
	pause: function (args) {
		var obj = {};
		
		if (typeof args.data != "undefined") {
			obj[args.id] = {action: "pause", args: args.data};
		} else {
			obj[args.id] = {action: "pause"};
		}
		_commandPPS.write(obj);
	},

	/**
	 * Triggers the resume event for the specified app
	 * @param name {String} The target app as specified by the id in config.xml
	 */
	resume: function (args) {
		var obj = {};
		
		if (typeof args.data != "undefined") {
			obj[args.id] = {action: "resume", args: args.data};
		} else {
			obj[args.id] = {action: "resume"};
		}
		_commandPPS.write(obj);
	},

	/**
	 * Triggers the reselect event for the specified app
	 * @param name {String} The target app as specified by the id in config.xml
	 */
	reselect: function (args) {
		var obj = {};
		
		if (typeof args.data != "undefined") {
			obj[args.id] = {action: "reselect", args: args.data};
		} else {
			obj[args.id] = {action: "reselect"};
		}
		_commandPPS.write(obj);
	},
	
	/**
	 * Writes the data object for the specified app
	 * @param args {Object}
	 * Ex. {
	 *	  id: {String} // Application attribute key
	 *	  data {Object} // The data object for the application
	 * }
	 */
	appData: function (args) {
		var obj = {},
			nId = '[n]' + args.id; // make this attribute non-persistent
		
		if (typeof args.data != "undefined" && args.data !== null) {
			obj[nId] = args.data;
		} else {
			obj[nId] = null;
		}
		_appDataPPS.write(obj);
	},

	/**
	 * Dispatches internal events triggered from the index
	 * @param action {String} The desired action
	 * @param args {Object} The object to forward to the client.
	 */
	dispatchEvent: function (action, args) {
		switch (action) {
			case 'started':
				_startedTrigger(args);
				break;
			case 'stopped':
				_stoppedTrigger(args);
				break;
			case 'error':
				_errorTrigger(args);
				break;
		}
	},

	/**
	 * Writes data to the status PPS object
	 * @param data {Object} The object to be written.
	 */
	setStatus: function (args) {
		var obj = {};
		
		if (args) {
			obj['[n]' + args.id] = args.time;
		}
		_statusPPS.write(obj);
	},

	/**
	 * Creates a PPS object and writes a timestamp
	 * @param time {int} The timestamp.
	 */
	setLoadComplete: function (time) {
		_navigatorLoadedPPS.write({'[n]time':time});
	},

	/**
	 * Removes the attribute specified from the command PPS object
	 * @param attribute {String} The attribute to be removed.
	 */
	removePPSEntry: function (attribute) {
		var obj = {};
		obj['-' + attribute] = {};
		_commandPPS.write(obj);
	},
	
	/**
	 * Sets the trigger function to call when a app start request event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setStartTrigger: function(trigger) {
		_startTrigger = trigger;
	},

	/**
	 * Sets the trigger function to call when an app stop request event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setStopTrigger: function(trigger) {
		_stopTrigger = trigger;
	},

	/**
	 * Sets the trigger function to call when an app start request event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setStartedTrigger: function(trigger) {
		_startedTrigger = trigger;
	},

	/**
	 * Sets the trigger function to call when an app stop request event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setStoppedTrigger: function(trigger) {
		_stoppedTrigger = trigger;
	},

	/**
	 * Sets the trigger function to call when an error event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setErrorTrigger: function(trigger) {
		_errorTrigger = trigger;
	}

};
