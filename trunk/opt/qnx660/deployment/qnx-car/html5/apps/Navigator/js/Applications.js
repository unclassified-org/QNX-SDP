Navigator.ns('Navigator');

/**
 *
 * @author dkerr
 * $Id: Applications.js 7734 2013-12-02 19:56:48Z mlapierre@qnx.com $
 */
Navigator.Applications = new ((function() {
	
	var self = this,
		_CURRENT_APP = 'qnxcar-current-app',
		_tablist,
		_appList = [],
		_callback,
		_history,
		_applicationPos = {},
		_applications = {},
		_deferredAppStartedEvents = [],
		_appTimeout = {},
		_appSwitchTimeout = 1,
		_currentApp = {},
		APP_LAUNCH_TIMEOUT = 60000,
		APP_SWITCH_TIMEOUT = 1000;
	
	///// EVENTS /////

	/**
	{
		event: 'Navigator.Applications.E_APP_STARTED',
	}
	*/
	this.E_APP_STARTED = 'Navigator.Applications.E_APP_STARTED';

	/**
	{
		event: 'Navigator.Applications.E_APP_STOPPED',
	}
	*/
	this.E_APP_STOPPED = 'Navigator.Applications.E_APP_STOPPED';

	/**
	{
		event: 'Navigator.Applications.E_APP_GROUP_COMPLETE',
	}
	*/
	this.E_APP_GROUP_COMPLETE = 'Navigator.Applications.E_APP_GROUP_COMPLETE';

	/**
	{
		event: 'Navigator.Applications.E_APP_ERROR',
	}
	*/
	this.E_APP_ERROR = 'Navigator.Applications.E_APP_ERROR';

	/**
	{
		event: 'Navigator.Applications.E_APP_COVER_CHANGE',
	}
	*/
	this.E_APP_COVER_CHANGE = 'Navigator.Applications.E_APP_COVER_CHANGE';

	///// PRIVATE METHODS /////

	/**
	 * Verifies a minimum set of fields in an application object. This
	 * should occur before the object is passed to the navigator extension's start method.
	 * @param application {Object} The application object
	 * @returns {Object} A verified application object
	 */
	var checkOptions = function (application) {
		var app = application;

		// no options? set the defaults here
		if (typeof app.opts === "undefined") {
			app.opts = {
				pos: _applicationPos
			};
		}
		
		// options present (like 'in-process'), but no size? set size here  
		if (typeof app.opts.pos === "undefined") {
			app.opts.pos = _applicationPos;
		}

		// default x, y, w & h to the largest available size bounded by the chrome
		if (typeof app.opts.pos.x === "undefined") {
			app.opts.pos.x = _applicationPos.x;
		}
		if (typeof app.opts.pos.y === "undefined") {
			app.opts.pos.y = _applicationPos.y;
		}
		if (typeof app.opts.pos.w === "undefined") {
			app.opts.pos.w = _applicationPos.w;
		}
		if (typeof app.opts.pos.h === "undefined") {
			app.opts.pos.h = _applicationPos.h;
		}
		if (typeof app.opts.pos.z === "undefined") {
			app.opts.pos.z = _applicationPos.z;
		}
		
		return app;
	};

	/**
	 * Loads the current tab object from the appId retrieved from the 
	 * history PPS object.  The appId corresponds to the id field in the tablist.
	 * @returns the current tab object or null if not found.
	 */
	var load = function () {
		var id = qnx.navigator.getLastTab(),
			tab = null;

		if (id) {
			tab = self.get('id', id, _tablist);
		} 

		return tab;
	}

	/**
	 * Saves the current tab id to the history PPS object.
	 * @param currentTab {Object} The currently selected tab object.
	 */
	var save = function (currentTab) {
		qnx.navigator.setLastTab(currentTab.id);
	}

	/**
	 * Retrieves the list of tabs from a local json file.
	 * This method has a dependency on xui.js 
	 * @param callback {Function} The function to call on completion.
	 */
	var loadTablist = function () {
		var tablist = {}

		x$().xhr('file:///apps/common/js/tablist.json', {
			async: false,
			callback: function () {
				tablist = JSON.parse(this.responseText);
			}
		});

		return tablist;
	};

	/**
	 * Retrieves the list of applications from the tablist.
	 * Compares with the history object to determine the selected tab.
	 * Launches the selected tab as a package (ie. an external process)
	 * to shorten boot time.
	 @ returns {Array} An array of objects to be sorted and launched sequentially. 
	 */
	var loadApplications = function () {
		var tablist = _tablist,
			currentTab = {},
			selectedTab = {},
			tabArray = [];

		selectedTab = self.getSelected(tablist);
		currentTab = load();

		if (currentTab) {
			if (currentTab.id !== selectedTab.id) {
				Object.keys(tablist).forEach( function (element) { 
					if (tablist[element].id === currentTab.id) {
						tablist[element].opts.selected = true;
					} else {
						tablist[element].opts.selected = false;
					}
				});
			}
		} else {
			save(selectedTab);
		}
	
		for(var tab in tablist) {
			if (tablist[tab].opts.selected === true) {
				tablist[tab].type = "package";
			}
			tabArray.push(tablist[tab]);
		}

		return tabArray;
	};

	/**
	 * Registers the application in the navigator with the specified key and calls
	 * its deferred onAppStarted event if applicable.
	 * @param key {Number} The application key.
	 * @param app {Object} The application object.
	 */
	var registerApplication = function(key, app) {
		if(!_applications.hasOwnProperty(key)) {
			// Add the key to the application object
			app.key = key;
			
			// Add the application to the list of applications the navigator is managing
			_applications[key] = app;
			
			// Call any deferred onAppStarted events
			if(_deferredAppStartedEvents.hasOwnProperty(key)) {
				onAppStarted(_deferredAppStartedEvents[key]);
				delete _deferredAppStartedEvents[key];
			}
		} else {
			console.error('Application with key ' + key + ' has already been registered.');
		}
	};
	
	/**
	 * Starts the next application object in the applist.  If the applist is empty,
	 * the callback function is called and the navigator overlay cover is removed. 
	 * Note: The tablist group needs to be complete before other apps are launched.
	 * @param callback {Object} The function to call on completion.
	 */
	self.startNextApp = function (callback) {
		var nextApp = _appList.shift();

		if (typeof callback == "function") {
			_callback = callback;
		}

		if (typeof nextApp != "undefined") {
			self.start(nextApp);
		} else {
			if (_callback !== null) {
				_callback();
			}

			/* not the best option but, at the moment, the navigator has no way of knowing 
			 * when the app has finished drawing its screen.
			 */

			setTimeout(function () {
				self.dispatch(self.E_APP_COVER_CHANGE, {coverState:false});
			}, 1000);
			
		}
	};
	
	/**
	 * The function called after all objects in the tablist have been started
	 */
	var onGroupComplete = function () {
		_callback = null;
		self.dispatch(self.E_APP_GROUP_COMPLETE);
	};

	/**
	 * The function called on the navigatorappstarted event
	 * @param event {Object} The event object
	 */
	var onAppStarted = function (event) {
		// clear the timeout, if exists
		if (_appTimeout[event.id]) {
			clearTimeout(_appTimeout[event.id]);
		}

		// Check if the application has been registered in the navigator
		if(_applications.hasOwnProperty(event.id)) {
			// Get the application from the list of registered applications
			var app = _applications[event.id];

			// Select the application
			if (typeof app.opts.selected != "undefined" && app.opts.selected) {
				_history = qnx.navigator.select(app.key);
			}
		
			// Set the application as visible
			if (typeof app.opts.visible != "undefined" && app.opts.visible === true) {
				qnx.navigator.set(app.key, {visible: true});
			} 

			// Dispatch the application started event
			self.dispatch(self.E_APP_STARTED, {app:app});

			// Start the next application
			self.startNextApp();
		} else {
			// This means the application hasn't been registered yet, so we'll defer the execution
			// until the application is registered.
			_deferredAppStartedEvents[event.id] = event;
		}
	};
	
	/**
	 * The function called on the navigatorappstopped event.
	 * @param e {Object} The event object
	 */
	var onAppStopped = function (event) {
		delete _applications[event.id];
		
		self.dispatch(self.E_APP_STOPPED, {key:event.id});
	};
	
	/**
	 * The function called on the navigatorerror event.
	 * @param event {Object} The event object
	 */
	var onAppError = function (event) {
		// clear the timeout, if exists
		if (_appTimeout[event.id]) {
			clearTimeout(_appTimeout[event.id]);
		}

		self.displayMessage({title:event.id, text:event.error});
		self.startNextApp();
	};
	
	/**
	 * An a,b function for the sort method.
	 * Sorts selected first, followed by the priority field.
	 * @param a {Object} The first object
	 * @param b {Object} The second object
	 */
	var compareSelectedPriority = function (a,b) {
		if (!a.opts.selected && b.opts.selected) {
			return 1;
		}
		if (a.opts.selected && !b.opts.selected) {
			return -1;
		}
		if (!a.opts.selected && !b.opts.selected) {
			if (!a.opts.priority && b.opts.priority) {
				return 1;
			} 
			if (a.opts.priority && !b.opts.priority) {
				return -1;
			}
			if (a.opts.priority && b.opts.priority) {
				return a.opts.priority - b.opts.priority;
			}
		}
		return 0;
	};

	///// PUBLIC METHODS /////

	/**
	 * Sets up the listeners and starts launching the core applications.
	 * @param webviewPos {Object} The x, y, width, height and z-order of the application screen window.
	 */
	self.init = function (applicationPos) {
		_applicationPos = applicationPos;

		blackberry.event.addEventListener("navigatorappstarted", onAppStarted);
		blackberry.event.addEventListener("navigatorappstopped", onAppStopped);
		blackberry.event.addEventListener("navigatorapperror", onAppError);
		
		_tablist = loadTablist();
		_appList = loadApplications().sort(compareSelectedPriority);

		self.dispatch(self.E_APP_COVER_CHANGE, {coverState:true});
		
		for (var app in _appList) {
			self.dispatch(self.E_APP_STARTED, {app:_appList[app]});
			if (!_appList[app].opts.visible) {
				// set to true when using  boot dependency manager
				_appList[app].opts.checkPreReqs = true;
			}
		}

		self.startNextApp(onGroupComplete);
	};


	/**
	 * Retrieves an array of the tab names.
	 * @returns {Array} The array of tab names.
	 */
	self.getTabList = function () {
		var tablist = [];
		
		for (var item in _applications) {
			tablist.push(_applications[item].name);
		}
		return tablist;
	};

	/**
	 * Retrieves a list of the names of the currently installed applications.
	 * @returns {Array} The array of application names.
	 */
	self.getAppList = function () {
		// get the active applications  
		var appObjList = qnx.application.getList(),
			appNameList = [];
			
		for (var item in appObjList) {
			appNameList.push(appObjList[item].name);
		}
		return appNameList;
	};

	/**
	 * Starts the application specified by the application object.
	 * @param application {Object} The applicaton object
	 * @returns {Number} The unique id (key) of the application. 
	 */
	self.start = function (application) {
		
		// check defaults and create an object to send to the navigator extension
		var app = checkOptions(application),
			obj = {
				scale: (app.opts.scale === true) ? true : false,
				x: app.opts.pos.x,
				y: app.opts.pos.y,
				w: app.opts.pos.w,
				h: app.opts.pos.h,
				z: app.opts.pos.z,
				name: app.name,
				id: app.id,
				checkPreReqs: (typeof app.opts.checkPreReqs != "undefined") ? app.opts.checkPreReqs : false
			},
			fullId = qnx.application.find(app.id),
			error = false,
			key;

		console.log('Starting: ' + app.name);

		switch(app.type) {
			// package - an installed application that will be launched and joined to a webview container
			case 'package':
				if (fullId != "undefined") {
					obj.packageName = fullId;
				} else {
					error = true;
				}
				break;
			// local - an installed application that will be loaded into the webview through the local:// url
			case 'local':
				if (fullId != "undefined") {
					obj.url = 'local:///apps/' + fullId + '/native/index.html';
				} else {
					error = true;
				}
				break;
			// local_out_of_process - an installed application that will be loaded into the webview through the local:// url
			// and started in a child process.  This is not available for package type.
			case 'local_oop':
				if (fullId != "undefined") {
					obj.url = 'local:///apps/' + fullId + '/native/index.html';
					obj.outprocess = true;
				} else {
					error = true;
				}
				break;
			// url - an external or locally host website or web application
			case 'url':
				if (typeof app.id != "undefined") {
					obj.url = app.id;
				} else {
					error = true;
				}
				break;
			// disabled - don't start this application but leave it in the tablist
			case 'disabled':
				self.startNextApp();
				return;
				break;
		}

		if (error) {
			self.displayMessage({title:app.name, text:"Application not found"});
			self.startNextApp();
			return;
		}

		// start the app and save the id.  The key is returned synchronously but the app
		// will start in the near future.
		key = qnx.navigator.start(obj);

		// start a timer - if an app fails after launch, it does not make a sound.
		_appTimeout[key] = setTimeout( function() {
			self.stop(key);
			// optional: add 'stay:true' to make the message persistant
			self.displayMessage({title:app.name, text:"Application timed out"});
			console.error("Application timed out: " + app.name);
			self.startNextApp();
		}, APP_LAUNCH_TIMEOUT);

		// Register the application within the navigator
		registerApplication(key, app);
		
		return key;
	};

	/**
	 * Stops the application specified by the application key.
	 * @param key {Number} The application key.
	 */
	self.stop = function (key) {
		qnx.navigator.stop(key);
	};

	/**
	 * Brings the selected application to the foreground and makes it visible.
	 * @param key {Number} The application key.
	 */
	self.select = function (key) {
		_history = qnx.navigator.select(key);
		_applications[_history.current].opts.selected = true;
		_applications[_history.previous].opts.selected = false;
		return _history;
	};

	/**
	 * Saves the current tab to the history object after a 1 second timer expires.
	 * @param currentApp {Object} The currently selected tab.
	 */
	self.save = function (currentApp) {
		_currentApp = currentApp;
		if (_appSwitchTimeout) {
			clearTimeout(_appSwitchTimeout);
			_appSwitchTimeout = setTimeout( function () {
				save(_currentApp);
			},APP_SWITCH_TIMEOUT);
		}
	};

	/**
	 * Sets the application's visibility to true.
	 * @param key {Number} The application key
	 */
	self.show = function (key) {
		qnx.navigator.set(key, {visible:true, zOrder: 0});
	};

	/**
	 * Sets the application's visibility to false
	 * @param key {Number} The application key
	 */
	self.hide = function (key) {
		qnx.navigator.set(key, {visible:false, zOrder: -99});
	};

	/**
	 * Displays a notification  
	 * @param args {Object} The notification object
	 * Ex. {
	 *      stayTime:   3000,       // time in milliseconds before the item disappears
	 *      text:       '',         // content text
	 *      title:      '',         // title text
	 *      stay:       false,      // should the notice item stay or not?
	 *      cls:      'notice'    	// any css class - user defined - only 'notice' at the moment
	 * }
	 *
	 */
	self.displayMessage = function (args) {
		if (typeof args != "undefined") {
			var msg = {};
			msg.type = "notice";
			msg.stayTime = (typeof args.stayTime != "undefined") ? args.stayTime : 8000;
			msg.text = (typeof args.text != "undefined") ? args.text : "";
			msg.title = (typeof args.title != "undefined") ? args.title : "ALERT";
			msg.stay = (typeof args.stay != "undefined") ? args.stay : false;
			msg.cls = (typeof args.cls != "undefined") ? args.cls : "notice";
			qnx.navigator.overlay.show(msg);
		}
	};

	/**
	 * Returns the currently selected application.
	 * @returns {Object} The application object
	 */
	self.getCurrent = function () {
		return _applications[_history.current];
	};

	/**
	 * Returns the previously selected application.
	 * @returns {Object} The application object
	 */
	self.getPrevious = function () {
		return _applications[_history.previous];
	};

	/**
	 * Returns the tab marked 'selected' from the tablist
	 * @params obj {Object} The collection of objects to search.
	 * @returns {Object} The selected application object
	 */
	self.getSelected = function (obj) {
		return Object.keys(obj).reduce(function (previous,current) {
			var tab = obj[current];
			return (tab.opts.selected === true) ? tab : previous;
		}, null);
	};

	/**
	 * Retrieves the value from the collection specified by the key. 
	 * @param key {String} The key field.
	 * @param value {String} The expected value of the key.
	 * @param collection {Object} The collection of objects to search. 
	 *							  Defaults to the '_applications' object if not included.
	 * @returns {Object} The object identified by the key, value pair.  
	 *					 Defaults to the last match if multiple matches are found.
	 *					 Returns null if no match is found. 
	 */
	self.get = function (key, value, collection) {
		if (arguments.length == 2) {
			collection = _applications;	
		} else {
			if (Object.prototype.toString.call(collection) !== "[object Object]") {
				return null;
			}
		}

		if (Object.prototype.toString.call(key) !== "[object String]") {
			return null;
		}

		if (Object.prototype.toString.call(value) !== "[object String]") {
			return null;
		}

		return Object.keys(collection).reduce(function (previous,current) {
			var obj = collection[current];
			return (obj[key] == value) ? obj : previous;
		}, null);
	};

	/**
	 * Loads the content of a tab that has been deferred while the platform dependencies are loading.
	 * @param key {Number} [Optional] The application key. If undefined then start all available 
	 *						tabs whose dependencies have been marked ready.
	 */
	self.loadDeferred = function (key) {
		qnx.navigator.loadDeferred(key);
	};

	self.getTimeouts = function () {
		return _appTimeout;
	};

}).extend(Navigator.EventDispatcher))();
