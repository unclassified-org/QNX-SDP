/**
 * QNXCAR Navigator 
 *
 * @author dkerr
 * $Id: index.js 8098 2014-01-14 21:16:18Z mlapierre@qnx.com $
 */

function QNXCAR_Navigator_() {

	var self = this,
		_chromeHeight = 60,
		_chromePos = {},
		_statusHeight = 25,
		_statusPos = {},
		_webviewsPos = {},
		_runningApps = {},
		_targetTab,
		_groupComplete = false
		_coverVisible = false;

	/**
	 * Function sets the dimensions and positioning of the nav bar
	 * 
	 * @param height {Number} Pixel height of the nav bar
	 */
	var setChromePos = function(height) {
		var chromePos = {
			x: 0,
			y: screen.height-height,
			w: screen.width,
			h: height,
			z: 2 
		};

		_chromeHeight = height;

		_chromePos = chromePos;
	};

	/**
	 * Function sets the dimensions and positioning of the status bar
	 * 
	 * @param height {Number} Pixel height of the status bar
	 */
	var setStatusPos = function(height) {
		var statusPos = {
			x: 0,
			y: 0,
			w: screen.width,
			h: height,
			z: 1 // important: the qnx.webviews.select will also ignore this zorder
		};

		_statusHeight = height;
		
		_statusPos = statusPos;
	};

	/**
	 * Function sets the dimensions and positioning of the keyboard
	 *
	 * @param height {Number} Pixel height of the keyboard
	 */
	var setKeyboardPos = function (height) {
		return {
			x:0,
			y:screen.height - height,
			width:screen.width,
			height:height,
			screenWidth:screen.width,
			screenHeight:screen.height
		};
	};

	/**
	 * Function sets the dimensions and positioning of the application windows
	 * 
	 * @param statusHeight {Number} Pixel height of the status bar
	 * @param chromeHeight {Number} Pixel height of the nav bar
	 */
	var setWebviewsPos = function(statusHeight, chromeHeight) {
		var webviewsPos = {
			x: 0,
			y: statusHeight,
			w: screen.width,
			h: screen.height-statusHeight-chromeHeight,
			z: -99
		};
		
		_webviewsPos = webviewsPos;
	};

	/**
	 * Called on application creation. This is dispatched from EventDispatcher.js
	 * @param e {Object} The event object
	 * Ex. e: {Object}{
	 *      data: {Object}{
	 *          app: {Object} {
	 *              key: {Number} // the webviews unique id
	 *              name: {String} // the pronouncable name
	 *          }
	 *      }
	 * }
	 */
	var onCreated = function (e) {
		var app = e.data.app,
			obj = {};
		
		// Check to ensure that this is a real tab and not something like the "status" app
		if(typeof app.opts.class != "undefined") {
			
			if (typeof app.key != "undefined") {
				Navigator.Tabs.replace(app);
			} else {
				Navigator.Tabs.create(app);
			}

			if (app.type != "url") {
				if (typeof app.opts.selected != "undefined" && app.opts.selected) {
					qnx.navigator.resume(app.id);
				} else {
					qnx.navigator.pause(app.id);
				}
			}
		}

		// The Status app is a special case.  It is included in the tablist.json but can't contain dimensions.
		// However, the dimensions are dynamically set by the screen resolution.
		if (app.id === 'Status') {
			qnx.navigator.set(app.key, {'geometry': _statusPos});
			console.log('status resize');
		}

		// The Rearview camera is another special case.  If installed, the window is created and the 
		// dimensions are dynamically set by the screen resolution.
		if (app.id === 'rearview_camera') {
			qnx.navigator.set(app.key, {'geometry': {x:0, y:_statusHeight, w:screen.width, h:screen.height-_statusHeight-_chromeHeight, z:-1}});
                        qnx.navigator.set(app.key, {'zOrder': -1});
                        qnx.navigator.pause(app.id);
			console.log('rearview camera resize');
		}

		if (typeof _runningApps[app.key] != "undefined") {
			// hide the target tab
			Navigator.Tabs.hide(_targetTab.key);

			// always go through the single code path to select a tab
			switchTab(app,3000);
		}
	};

	/*
	 * Called when a webview is destroyed.  This is dispatched from EventDispatcher.js
	 * @param e {Object} The event object
	 * Ex. e: {Object}{
	 *      data: {Object}{
	 *          id: {String} // the webviews unique id
	 *      }
	 * }
	 */
	var onDestroyed = function (e) {
		Navigator.Tabs.remove(e.data.key);
		
		if (typeof _runningApps[e.data.key] != "undefined") {
			Navigator.Tabs.show(_targetTab.key);
			Navigator.Tabs.highlight(_targetTab.key);
			Navigator.Applications.select(_targetTab.key);
			Navigator.Applications.save(_targetTab);
			delete _runningApps[e.data.key];
		}

	};

	/*
	 * Function to handle Voice Recognition cancel, and unknown command 
	 * @param e {Object} The event object
	 * Ex. e: {Object}{
	 *      data: {Object}{
	 *      }
	 * }
	 */
	var onVoiceCancel = function (e) {
		var previous = Navigator.Applications.getCurrent(); 

		switchTab(previous,500);
	};

	/**
	 * Called when a app start is requested. (on /pps/services/app-launcher 'cmd' change)
	 * This is dispatched from blackberry.events - "navigatorappstart"
	 * @param e {Object} The event object
	 * Ex. e: {Object}{
	 *      app: {String} // The pronouncable name - corresponds to the 'name' attribute in the tablist.json
	 *      dat: {String} // [optional] Data to be sent to the app.
	 * }
	 */
	var onAppStartRequest = function (e) {
		// do not allow 3rd party apps to launch before the tabs are launched
		if (!_groupComplete) {
			return;
		}

		// get the tablist. ie. the current group of managed webviews.
		// also get the applist - applications can be installed or uninstalled at any time.
		var tabList = Navigator.Applications.getTabList(),
			appList = Navigator.Applications.getAppList(),
			app, 
			dat; 

		// requests from internal dispatches format the event differently -> e.data
		if (typeof e.data != 'undefined') {
			app = e.data.app;
			dat = e.data.Data;
		} else {
			app = e.app;
			dat = e.dat;
		}

		console.log(tabList, app, dat);

		if (typeof dat != "undefined") {
			// app names with spaces will not write to PPS
			qnx.navigator.appData(app.replace(/\s+/g, ''), dat);
		}
		
		// Check for tabs first.  Tabs will also exist in the app list.  
		if (tabList.indexOf(app) != -1) {
			var tab = Navigator.Applications.get('name', app);

			switchTab(tab,3000, dat);
		}
		// app?
		else if (appList.indexOf(app) != -1) {
			// stop any running apps
			if (Object.keys(_runningApps).length > 0 && isAppRunning(app) === null) {
				Navigator.Applications.stop( parseInt(Object.keys(_runningApps)[0], 10) );
			}
			// e.dat is optional, if not available - it will be undefined
			launchApp(app);
			// hide the target tab before the app is created
			Navigator.Applications.hide(_targetTab.key);
		}
	};
	
	/**
	 * Called when a app stop is requested. (on /pps/services/app-launcher 'cmd' change)
	 * This is dispatched from blackberry.events - "navigatorappstop"
	 * @param e {Object} The event object
	 * Ex. e: {Object}{
	 *      app: {String} // The pronouncable name - corresponds to the 'name' attribute in the tablist.json
	 * }
	 */
	var onAppStopRequest = function (e) {
		// confirm selected app is not a tab
		console.log('stop request ', e);
		var app = Navigator.Applications.get('name', e.app);
		
		if (app !== null && typeof _runningApps[app.key] != "undefined") {
			Navigator.Applications.stop(app.key);
			//qnx.navigator.remove(app.id);
		}
	};

	/**
	 * Called when a tab UI element is touched, voice command launched or launched remotely.
	 * @param e {Object} The event object
	 * Ex. e: {Object}{
	 *      data: {Object}{
	 *          tab: {Object} {
	 *              id: {Number} // the webviews unique id
	 *              key: {String} // the name registered by each app
	 *          } 
	 *          remote: {Object} { // [optional]
	 *              dat: // data to be passed along to the app in the resume event
	 *          },
	 *          reselect: {Boolean} // true if the UI element has been touched while in a highlighted state
	 *      }
	 * }
	 */
	var onSelected = function (e) {
		var tab = e.data.tab,
			previous = Navigator.Applications.getCurrent();
		
		// decide what action to take on UI selection
		if (tab.opts.voice === true) {
			Navigator.Voice.select();
		} else {

			// not all onSelected events are from touch events so highlight the tab
			if (tab.id != 'rearview_camera') {
				Navigator.Tabs.highlight(tab.key);
			}
			Navigator.Applications.select(tab.key);

			// do not save 3rd party apps in the tablist
			if (!_runningApps.hasOwnProperty(tab.key) && _groupComplete && tab.id != 'rearview_camera') {
				Navigator.Applications.save(tab);
			}
		}
		
		// decide what event to send to the selected and previously active app.
		// The touch arg is set to true by re-tapping an active menu button.
		// 'pause' and 'resume' are blackberry events.  'reselect' is unique to CAR2.
		handleEvents(tab, e.data);

	};
	
	/**
	 * Called to indicate the tab list has finished loading.
	 */
	var onGroupComplete = function () {
		// load the voice module passing the list of apps.  Tabs are added on creation.
		Navigator.Voice.on(Navigator.Voice.E_VOICE_CANCEL, onVoiceCancel);

		//explicitly filter out undesired apps from voice commands
		var apps = Navigator.Applications.getAppList();
		var appsToRemove = ["Old Media Player", "Navigator", "Rearview Camera"];

		for (var i=0; i<appsToRemove.length; i++) {
			var index = apps.indexOf(appsToRemove[i]);
			if (index >= 0) {
				apps.splice(index, 1);
			}
		}

		//initialize voice commands
		Navigator.Voice.init(apps);

		// the boot dependency manager may have already loaded some dependencies for our tabs by this point
		// check by passing no args to loadDeferred
		Navigator.Applications.loadDeferred();

		// the navigator extension is now 'aware' of the tabs - OK accept app launch requests now
		_groupComplete = true;

	};

	/**
	 * Called to indicate the overlay cover and should be conveyed the tabs.
	 */
	var onAppCoverChange = function (e) {
		var coverState = e.data.coverState;
		
		if (coverState) {
			Navigator.Tabs.disableAll();
		} else {
			if (_coverVisible) {
				qnx.navigator.overlay.hide({type:'cover'});
				_coverVisible = false;
			}
			if (!Navigator.Tabs.isEnabled('all')) {
				Navigator.Tabs.enableAll();
			}
		}
	};

	/**
	 * Called on sensor updates - we are only concerned with the rearview camera 
	 */
	var onCarSensorUpdate = function (e) {
		var key = Object.keys(e)[0];
		switch (key) {
			case "cameraRearviewActive":
				var webview = Navigator.Applications.get('id', 'rearview_camera');

				console.log('rearview camera: ' + e[key]);

				if (e[key] === 'true') {
					qnx.navigator.set(webview.key, {'geometry': {x:0, y:0, w:screen.width, h:screen.height}, 'zOrder': 2});
					qnx.navigator.resume(webview.id);
				} else {
					qnx.navigator.set(webview.key, {'geometry': {x:0, y:_statusHeight, w:screen.width, h:screen.height-_statusHeight-_chromeHeight}, 'zOrder': -1});
					qnx.navigator.pause(webview.id);
				}
				break;
			default:
				break;
		}
	};
	
	/**
	 * Wrapper function to switch a tab through onSelected.  The delay parameter is needed by the UI since
	 * there is currently no way to determine when the tab switch, app launch or cancellation is complete.
	 * @params tab {Object} the target tab or app
	 * @params delay {Number} the number of milliseconds to delay before cancelling voice req (if active)
	 */
	var switchTab = function (tab, delay, data) {
		var obj = {};
		obj.data = {};
		obj.data.tab = tab;
		obj.data.remoteDelay = (isNaN(delay)) ? delay : 500;
		obj.data.remote = data;
		onSelected(obj);
	};
	
	/**
	 * Uses the navigator extension to send pause, resume or reselect events
	 * to the current and previously selected tab (or app)
	 * @params tab {Object} the tab (or app) that has been selected
	 * @params args {Object} arguments for the object 
	 * Ex. {
	 *      reselect: {Boolean} attached by the Tabs.js module to indicate a second touch on the tab UI.
	 *      remote: {Object} {
	 *           dat: {Object} an option object arguement the resume event can pass to the target application. 
	 *      }
	 * }
	 */
	var handleEvents = function (tab, args) {


		if (tab.type != "url") {
			var previous = Navigator.Applications.getPrevious();

			// the presence of 'reselect' indicates a manual tab selection
			// this automatically cancels voice commands
			if (typeof args.reselect != 'undefined' && Navigator.Voice.isActive()) {
				Navigator.Voice.cancel();
			}
			if (previous.id === 'rearview_camera') {
				console.log('handleEvents ' , previous);
				qnx.navigator.pause(previous.id);
			}
			if (args.reselect) {
				qnx.navigator.reselect(tab.id);
				if (typeof _runningApps[tab.key] != "undefined") {
					Navigator.Applications.stop(tab.key);
				}
			} else {
				if (typeof args.remote != "undefined") {
					// with data for the app
					qnx.navigator.resume(tab.id, args.remote);
				} else {
					// without data for the app
					qnx.navigator.resume(tab.id);
				}
				if (previous.id != tab.id && previous.type != "url"){
					// launched apps or first start
					qnx.navigator.pause(previous.id);
				}
			}
		}
	};

	/**
	 * Find a running app by name
	 * @params appName {String} The name of the application as it appears in applications pps after installation.
	 * @returns {Object} The app object or null if not found.
	 */
	var isAppRunning = function (appName) {
		return Object.keys(_runningApps).reduce(function (previous,current) {
				var app = _runningApps[current];
				return (app.name === appName) ? app : previous;
		}, null);
	};
	
	/**
	 * Function to launch an app.
	 * @params appName {String} The name of the application as it appears in applications pps after installation.
	 */
	var launchApp = function (appName) {
		var app = {
				name: appName,
				type: 'package',
				opts: {
					pos: _webviewsPos,
					selected: true
				}
			},
			list = qnx.application.getList(),
			appFound;

		if (list[app.name] != "undefined") {
			// this seems a bit redundant but apps launched through this path are identified by their names 
			// (ie. ASR command or AppSection selection) rather than their id (ie. tablist.json)
			// lookup partial id through applications pps list 
			var id = list[app.name].id;

			app.id = id.slice(0,id.lastIndexOf('.'));
		} else {
			Navigator.Applications.displayMessage({title:appName, text:"Application not found."});
			return;
		}

		// the target tab is the tab that will be 'replaced' by the new app
		_targetTab = Navigator.Applications.get('name','Apps Section');

		// is appName already running?
		appFound = isAppRunning(appName);

		// if not found, create the launch and store the key, order and class
		if (appFound === null) {
			if (!_coverVisible) {
				qnx.navigator.overlay.show({type:'cover'});
				_coverVisible = true;
			}
			app.key = Navigator.Applications.start(app);
			app.order = _targetTab.order;
			app.opts.class = _targetTab.opts.class;

			// need to track launched apps
			_runningApps[app.key] = app;
		} else {
			Navigator.Applications.displayMessage({title:appName, text:"Already running."});
		}
	};
	
	/**
	 * Initialize the navigator application
	 */
	self.init = function () {
		setChromePos(document.querySelector("#dummyElements .navBar").offsetHeight); // Set the height of the nav bar according to its dummy element height
		setStatusPos(document.querySelector("#dummyElements .statusBar").offsetHeight); // Set the height of the status bar according to its dummy element height
		var keyboardSettings = setKeyboardPos(document.querySelector("#dummyElements .keyboard").offsetHeight); // Set the height of the keyboard according to its dummy element height

		setWebviewsPos(_statusHeight, _chromeHeight); // Set the default application window settings

		// IMPORTANT! Changes the application window size from default fullscreen to custom, smaller size
		qnx.navigator.init(_chromePos);

		// re-direct the overlay to the mini-site in this application
		qnx.navigator.overlay.init({dim:_webviewsPos, url:'local:///overlay-resources/ui.html'});

		// load and initialize keyboard overlay
		qnx.keyboard.overlay.init(keyboardSettings);

		// listener for rearview camera 
		blackberry.event.addEventListener("car.sensors.event.update", onCarSensorUpdate);

		// load the app applications
		Navigator.Applications.on(Navigator.Applications.E_APP_STARTED, onCreated);
		Navigator.Applications.on(Navigator.Applications.E_APP_STOPPED, onDestroyed);
		Navigator.Applications.on(Navigator.Applications.E_APP_ERROR, function(e) {console.log(e);});
		Navigator.Applications.on(Navigator.Applications.E_APP_GROUP_COMPLETE, onGroupComplete);
		Navigator.Applications.on(Navigator.Applications.E_APP_COVER_CHANGE, onAppCoverChange);
		Navigator.Applications.init(_webviewsPos);

		// create the tab assets and handlers
		Navigator.Tabs.on(Navigator.Tabs.E_TAB_SELECTED, onSelected);
		Navigator.Tabs.init(_chromePos); 

		// start the remote request listeners. External applications will not have root permissions to launch
		// an app.  The app-launcher pps object handles these requests.
		blackberry.event.addEventListener("navigatorstartrequest", onAppStartRequest);
		blackberry.event.addEventListener("navigatorstoprequest", onAppStopRequest);

		// start the HMI policy manager
		Navigator.HNM.on(Navigator.HNM.E_MODAL_SELECTED, onAppStartRequest);
		Navigator.HNM.init();
		
	};
}

QNXCAR2 = new QNXCAR_Navigator_();
