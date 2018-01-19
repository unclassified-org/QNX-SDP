/**
* The abstraction layer for qnx application functionality
 *
 * @author nschultz
 * $Id: application.js 4610 2012-10-15 18:05:13Z mlytvynyuk@qnx.com $
 */

var _pps = require("lib/pps/ppsUtils"),
	_readerPPS,
	_writterPPS,
	_installedTrigger,
	_uninstalledTrigger,
	_startedTrigger,
	_stoppedTrigger,
	_appObjList = {}; 

/**
 * Builds a list of application names and an organized group of application objects
 * for convenient retrieval later.
 */
function buildNameList () {
	var applications;
		
	_readerPPS.read();
	applications = _readerPPS.ppsObj;

	// reinitialize _appObjList
	delete _appObjList;
	_appObjList = {};

	for (var key in applications) {
		var item = applications[key],
			itemData = item.split(",");
			
		// skip if this is the android player
		if (key.indexOf('sys.android') == 0)
			continue;

		// create an app object then adjust for variances in the applications pps object
		var appData = {
			name: itemData[1],
			group: itemData[2],
			id: key,
			uri: 'null',
			icon: 'default'
		};

		// some applications use sys.uri or uri to identify themselves as chromeless browser apps
		if (appData.id.indexOf("sys.uri") != -1) {
			appData.uri = itemData[10];
		} else {
			if (appData.id.indexOf("uri") != -1) {
				appData.uri = itemData[3];
			}
		}

		// some applications have the icon in a different path
		appData.icon = (appData.id.indexOf("uri") === 0) ? itemData[0] : ("/" + key + "/" + itemData[0]);

		// some webworks applications append the icon dimensions in the middle of the path. 
		appData.icon = appData.icon.replace(/{(\d+x\d+)}/g, "");

		_appObjList[appData.name] = appData;

	}
}

/*
 * Exports are the publicly accessible functions
 */
module.exports = {
	init: function () {
		//reader
		_readerPPS = _pps.createObject();
		_readerPPS.init();
		_readerPPS.onChange = function (event) {
			buildNameList();
			if (event) {
				if (event.changed) {
					if (_installedTrigger) { 
						_installedTrigger(event); 
					}
				} else if (event.remove) {
					if (_uninstalledTrigger) { 
						_uninstalledTrigger(event); 
					}
				}
			}
		};
		_readerPPS.onReady = function(data) {
			buildNameList();
		};
		_readerPPS.open("/pps/system/navigator/applications/applications", JNEXT.PPS_RDONLY);

		//writer
		_writerPPS = _pps.createObject();
		_writerPPS.init();
		_writerPPS.onChange = function (event) {
			if (event) {
				if (event.started) {
					if (_startedTrigger) { 
						_startedTrigger(event); 
					}
				} else if (event.stopped) {
					if (_stoppedTrigger) { 
						_stoppedTrigger(event); 
					}
				}
			}
		};
		_writerPPS.open("/pps/services/app-launcher", JNEXT.PPS_RDWR);
	},

	/**
	 * Returns the list of applications
	 * @return {Object} A collection of the installed application objects
	 */
	getList: function() {
		return _appObjList;
	},

	/**
	 * Finds the installed ID of a specific application by its user-defined id
	 * @param id {String} The app id to find, corresponds to the id in config.xml
	 * @return {String} The full id string created on installation
	 */
	find: function (partialId) {
		var fullId = "undefined"; //TODO should return null if not found
		
		for (var obj in _appObjList) {
			if (_appObjList[obj].id.indexOf(partialId + '.') != -1) {
				fullId = _appObjList[obj].id;
				break;
			}
		}
		return fullId;
	},


	/**
	* Sets the trigger function to call when a install event is fired
	* @param trigger {Function} The trigger function to call when the event is fired
	*/
	setInstalledTrigger: function (trigger) {
		_installedTrigger = trigger;
	},

	/**
	* Sets the trigger function to call when a uninstalled event is fired
	* @param trigger {Function} The trigger function to call when the event is fired
	*/
	setUninstalledTrigger: function (trigger) {
		_uninstalledTrigger = trigger;
	},

	/**
	* Sets the trigger function to call when a started event is fired
	* @param trigger {Function} The trigger function to call when the event is fired
	*/
	setStartedTrigger: function (trigger) {
		_startedTrigger = trigger;
	},

	/**
	* Sets the trigger function to call when a stopped event is fired
	* @param trigger {Function} The trigger function to call when the event is fired
	*/
	setStoppedTrigger: function(trigger) {
		_stoppedTrigger = trigger;
	},

	/**
	* Creates a request to start an application
	* @param id {String} The id of the application to start
	* @param data {Object} The startup data for the application
	*/
	start: function(id,data){
		var obj = {id:id, cmd:"launch app",app:id,dat:data};
		_writerPPS.write({req:obj});
	},

	/**
	* Creates a request to stop an application
	* @param id {String} The id of the application to stop
	*/
	stop: function(id){
		var obj = {id:id, cmd:"close app",app:id,dat:""};
		_writerPPS.write({req:obj});
	}
};