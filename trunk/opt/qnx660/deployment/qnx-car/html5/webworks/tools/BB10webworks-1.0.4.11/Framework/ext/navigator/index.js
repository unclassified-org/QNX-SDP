/**
 * Provides utility functions for the management of applications
 *
 * @author dkerr
 * $Id: index.js 4545 2012-10-09 15:55:06Z dkerr@qnx.com $
 */

var _wwfix = require("../../lib/wwfix"),
	_event = require("../../lib/event"),
	_utils = require("../../lib/utils"),
	_webview = require("../../lib/webview"),
	_webviews = require("./webviews"),
	_launcher = require("./launcher"),
	_jscreen = require("./jscreen"),
	_navigator = require("./navigator"),
	_bootMgr = require("./bootmgr"),
	_hnm = require("./hnm"),
	_startDeferred = false,
	_modulesDone = false,
	_actionMap = {
		navigatorstartrequest: {
			context: require("./context"),
			event: "navigatorstartrequest",
			trigger: function (args) {
				_event.trigger("navigatorstartrequest", args);
			}
		},
		navigatorstoprequest: {
			context: require("./context"),
			event: "navigatorstoprequest",
			trigger: function (args) {
				_event.trigger("navigatorstoprequest", args);
			}
		},
		navigatorappstarted: {
			context: require("./context"),
			event: "navigatorappstarted",
			trigger: function (args) {
				_event.trigger("navigatorappstarted", args);
			}
		},
		navigatorappstopped: {
			context: require("./context"),
			event: "navigatorappstopped",
			trigger: function (args) {
				_event.trigger("navigatorappstopped", args);
			}
		},
		navigatorapperror: {
			context: require("./context"),
			event: "navigatorapperror",
			trigger: function (args) {
				_event.trigger("navigatorapperror", args);
			}
		},
		navigatorhnmstatus: {
			context: require("./context"),
			event: "navigatorhnmstatus",
			trigger: function (args) {
				_event.trigger("navigatorhnmstatus", args);
			}
		},
		navigatorhnmnotification: {
			context: require("./context"),
			event: "navigatorhnmnotification",
			trigger: function (args) {
				_event.trigger("navigatorhnmnotification", args);
			}
		}
	};

/**
 * Initializes the extension 
 */
function init() {
	try {
		var eventExt = _utils.loadExtensionModule("event", "index");
		eventExt.registerEvents(_actionMap);
		_webviews.init();
		_navigator.init();
		_navigator.setStatus({id:'ext_init', time: new Date().getTime()});
		_hnm.init();
	} catch (ex) {
		console.error('Error in webworks ext: navigator/index.js:init():', ex);
	}
}
init();

/**
 * Event triggered by jscreen windowcreated.
 * @param event {Object} The event object that contains the PID
 */
function onWindowCreated (event) {

	// match pid returned and object pid
	var webview = _webviews.getByPid(event.pid),
		webviewGroup = _webviews.getWebviewGroup(webview.id);

	try {
		if (_jscreen.join(event.pid, webviewGroup) === "Ok") {
			if (_jscreen.zOrder(event.pid, 1) !== "Ok") {
				throw("Jscreen couldn't set zOrder");
			}
			if (_jscreen.resize(event.pid, webview.params.w, webview.params.h, webview.params.scale) !== "Ok") {
				throw("Jscreen couldn't resize");
			}
			// set the geometry here rather than on webview creation to avoid strange width, height behaviour
			webview.setGeometry(webview.params.x,webview.params.y,webview.params.w,webview.params.h);
		} else {
			throw("Jscreen couldn't join to webview");
		}
		_navigator.setStatus({id:webview.params.id + '_loaded', time: new Date().getTime()});
		_navigator.dispatchEvent("started", {id:webview.id, pid:webview.pid});
		if (_modulesDone) {
			_navigator.setLoadComplete(new Date().getTime());
		}

	} catch (error) {
		_navigator.dispatchEvent("error", {id:webview.params.name,error:error});
		_launcher.stop(event.pid);
	}
}

/**
 * Event triggered by launcher start, stop or error operations.
 * @param event {Object} The event object 
 */
function onLauncherChange (event) {
	// launcher provides some feedback after an action
	if (event != "" && event.data && event.data.err) {
		var webview = _webviews.getById(event.data.id);
		
		// destroy the empty webview if error on start
		if (typeof event.data.res  != "undefined" && event.data.res == "start") {
			_webviews.destroy(webview.id);
		}
		
		// dispatch the failed to start error event
		_navigator.dispatchEvent("error", {id:webview.params.name,error:event.data.errstr});
		return;
	}
	if (event != "" && event.changed.dat && event.data.res == "start") {
		var webviewId = _webviews.getById(event.data.id).id,
			pid = event.data.dat;

		if (pid.indexOf('dev_mode') != -1) {
			pid = event.data.dat.split(',')[0];
		}
		
		// the app has started; save the PID.  Later, when the window is created we can match the two up.
		_webviews.setPid(webviewId, pid);
	}
	if (event != "" && event.changed.msg && event.data.msg == "stopped") {
		var webviewId = _webviews.getByPid(event.data.dat).id;
		
		_webviews.destroy(webviewId);
	}
}

/**
 * Event triggered when a webview is created. 
 * @param webview {Object} The webview object 
 */
function onWebviewCreated (webview) {
	if (typeof webview.params.packageName != "undefined") {
		if (webview.params.checkPreReqs) {
			_navigator.dispatchEvent("started", {id:webview.id,pid:"deferred"});
		} else {
			_launcher.start(webview.params.packageName, webview.id, webview.params.w, webview.params.h);
		}
	} else {
		var obj = {};
	
		obj.id = webview.id;
		obj.url = (webview.params.checkPreReqs) ? "deferred" : webview.params.url;

		if (webview.params.checkPreReqs) {
			obj.url = "deferred";
		} else {
			obj.url = webview.params.url;
			_navigator.setStatus({id:webview.params.id + '_loaded', time: new Date().getTime()});
			if (_modulesDone) {
				_navigator.setLoadComplete(new Date().getTime());
			}
		}

		_navigator.dispatchEvent("started", obj);
	}

	if (!webview.params.checkPreReqs && _startDeferred && _bootMgr.isLauncherReady()) {
		startNextDeferred();
	} 
}

/**
 * Event triggered when a webview is destroyed. 
 * @param args {Object} The event object: args.id  
 */
function onWebviewDestroyed (args) {
	// dispatch the app stopped event to the client
	_navigator.dispatchEvent("stopped", {id:args.id});
}

/**
 * Event triggered on a bootmgr response
 * @param appId {String} The app's unique identifier  
 */
function onBootMgrResponse (appId) {

	// place bootmgr non-application references here.
	if (appId === 'launcher') {
		_launcher.init();
	} 

	if (_bootMgr.isLauncherReady() && _startDeferred) {
		startNextDeferred();
	}
}

/**
 * Retrieve a valid webview from the bootmgr's list of modules.
 * This filters out modules like 'car2-input, ASR etc.'
 */
function getValidWebview () {
	var found = false,
		webview = null;

	while (!found) {
		var appId = _bootMgr.getNextModule(),
			webview;

		if (appId == 'BOOTMGR-MODULES-DONE') {
			_modulesDone = true;
		} else {
			webview = _webviews.getByAppId(appId);
		}

		if (typeof appId == 'undefined' || webview !== null) {
			found = true;
		}
	}
	return webview;
}

/**
 * Started deferred webviews serially to ease congestion through to storage media. 
 */
function startNextDeferred () {
	var webview = getValidWebview();

	if (webview !== null) {
		_webviews.loadDeferred(webview.id);
	} 
}

/**
 * Exports are the publicly accessible functions
 */
module.exports = {

	/**
	 * Sets the application's webview to a non-screen defined size.
	 * Initializes and connects to JScreen plugin.
	 * @param args {Object} The window dimensions of the Navigator application
	 */
	init: function (success, fail, args, env) {
		var args = _wwfix.parseArgs(args);
		
		// record the Navigator extension start time.
		_navigator.setStatus({id:'app_init', time: new Date().getTime()});

		// the navigators webview must be resized
		_webview.setGeometry(args.x, args.y, args.w, args.h);
		
		// set triggers for webviews, launcher and jscreen
		_webviews.setCreatedTrigger(onWebviewCreated);
 		_webviews.setDestroyedTrigger(onWebviewDestroyed);
		_launcher.setTrigger(onLauncherChange);
		_jscreen.setTrigger(onWindowCreated);
		_bootMgr.setResponseTrigger(onBootMgrResponse);
		
		_bootMgr.init();
		_jscreen.init();
		success();
	},
	
	/**
	 * Starts the specified application.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: 
	 * @param env {Object} Environment variables
	 */
	start: function (success, fail, args, env) {
		var localArgs = _wwfix.parseArgs(args),
			id = _webviews.create(localArgs);

		_navigator.setStatus({id: localArgs.id + '_started', time: new Date().getTime()});

		if (id != -1) {
			success(id);
		} else {
			fail(-1, "Error starting app.");
		}
	},

	/**
	 * Stops the specified application.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: 
	 * @param env {Object} Environment variables
	 */
	stop: function (success, fail, args, env) {
		var args = _wwfix.parseArgs(args),
			id = (typeof args.id == "number") ? args.id : 0, 
			webview = _webviews.getById(id);
		
		if (typeof webview != "undefined") {
			_navigator.removePPSEntry(webview.params.id);
			if (typeof webview.pid != "undefined") { 
				_launcher.stop(webview.pid);
			} else {
				_webviews.destroy(id);
			}
			success();
		} else {
			fail(-1, "Invalid ID");
		}	
	},

	/**
	 * Selects a webview
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 * Ex: {
	 *	  id: <webviewId>
	 *  }
	 * @param env {Object} Environment variables
	 */
	select: function (success, fail, args, env) {
		var id = _wwfix.parseArgs(args).id,
			history = _webviews.select(id);

		if( history != -1) {
			success(history);
		} else {
			fail(-1, "Error selecting webview");
		}
	},
	
	/**
	 * Triggers the pause event for the specified application
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: id
	 * @param env {Object} Environment variables
	 */
	pause: function(success, fail, args, env) {
		try {
			var args = _wwfix.parseArgs(args);
			_navigator.pause(args);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Triggers the resume event for the specified application
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: id
	 * @param env {Object} Environment variables
	 */
	resume: function(success, fail, args, env) {
		try {
			var args = _wwfix.parseArgs(args);
			_navigator.resume(args);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Triggers the reselect event for the specified application
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: id
	 * @param env {Object} Environment variables
	 */
	reselect: function(success, fail, args, env) {
		try {
			var args = _wwfix.parseArgs(args);
			_navigator.reselect(args);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Provides the data object for the specified app
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: id, data
	 * @param env {Object} Environment variables
	 */
	appData: function(success, fail, args, env) {
		try {
			var args = _wwfix.parseArgs(args);
			_navigator.appData(args);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Sets a parameter in a webview
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 * Ex: { 
	 *	id: {Number},
	 *	{
	 *		visible: {Boolean},
	 *		zOrder: {Number},
	 *		geometry: {x:<x>, y:<y>, w:<width>, h:<height>, scale:{Boolean}},
	 *		url: {String}
	 *	}
	 *  }
	 * @param env {Object} Environment variables
	 */
	set: function (success, fail, args, env) {
		var args = _wwfix.parseArgs(args),
			id = args.id,
			params = args.obj;
		
		if (typeof id == "undefined") {
			fail(-1, "No webview ID specified");
		} else {
			for (var param in params) {
				switch (param) {
					case 'visible':
						try {
							_webviews.setVisible(id, params[param]);
							success();
						} catch (e) {
							fail(-1, e);
						}
						break;
					case 'zOrder':
						try {
							_webviews.setZOrder(id, params[param]);
							success();
						} catch (e) {
							fail(-1, e);
						}
						break;
					case 'geometry':
						try {
							var pid = _webviews.getById(id).pid;

							if (typeof pid != "undefined") {
								_jscreen.resize(pid, params[param].w, params[param].h, params[param].scale);
							}
							_webviews.setGeometry(id, params[param]);
							success();
						} catch (e) {
							fail(-1, e);
						}
						break;
					case 'url':
						try {
							_webviews.setURL(id, params[param]);
							success();
						} catch (e) {
							fail(-1, e);
						}
						break;
					default:
						fail(-1, "option not recognized");
				}
			}
		}
	},

	/**
	 * Gets the list of webviews
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: n/a
	 * @param env {Object} Environment variables
	 */
	getList: function (success, fail, args, env) {
		try {
			success(_webviews.getList());
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Loads the content of a deferred webview
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: id - the webview id
	 * @param env {Object} Environment variables
	 */
	loadDeferred: function (success, fail, args, env) {
		try {
			_startDeferred = true;
			if (_bootMgr.isLauncherReady()) {
				startNextDeferred();
			}
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Saves the appId of the last tab to the history object
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: appId
	 * @param env {Object} Environment variables
	 */
	setLastTab: function (success, fail, args, env) {
		try {
			var args = _wwfix.parseArgs(args);

			if (args.appId && args.appId != 'undefined') {
				_bootMgr.setLastTab(args.appId);
				success();
			}
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Retrieves the appId of the last tab from the history object
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. n/a
	 * @param env {Object} Environment variables
	 */
	getLastTab: function (success, fail, args, env) {
		try {
			success(_bootMgr.getLastTab());
		} catch (e) {
			fail(-1, e);
		}
	}
};
