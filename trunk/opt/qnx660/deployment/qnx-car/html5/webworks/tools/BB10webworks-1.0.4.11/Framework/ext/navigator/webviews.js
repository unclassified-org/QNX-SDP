/**
 * The abstraction layer for webviews functionality
 *
 * @author dkerr
 * $Id: webviews.js 4612 2012-10-16 17:27:19Z dkerr@qnx.com $
 */

var resourceRequest = require("./resourceRequest"),
	webkitOriginAccess = require("../../lib/policy/webkitOriginAccess"),
	_utils = require("../../lib/utils"),
	_readyTrigger,
	_destroyedTrigger,
	_prevWebview,
	_currWebview,
	_webviews = {},
	_process = 0,
	_appEvents = _utils.loadExtensionModule("application.event", "application");

/**
 * String helper utility to determine if the string refers to an extension.  
 */
function isExtension(element, index, array) {
	var re = /^(ext\/)/i;
	return (element.match(re));
}

/**
 * String helper utility to match the extension name.  
 */
function extensionName(element, index, array) {
	// match the text between of the string that begins with 'ext/' to the first '/'  
	var re = /^(ext)\/(.+?)(?=\/)/;
	return element.match(re)[2];
}

/**
 * String helper utility for removing duplicates from an array.  
 */
function unique(element, index, array) {
	return array.indexOf(element) == index;
}

/**
 * Wraps the body of the extension in a define function
 * @param {String} moduleName The normalized name of the extension
 * @param {String} body The full text body of the extension
 */
function getDefineString(moduleName, body) {
	var evalString = 'define("' + moduleName + '", function (require, exports, module) {',
		isJson = /\.json$/.test(moduleName);

	evalString += isJson ? ' module.exports = ' : '';
	evalString += body.replace(/^\s+|\s+$/g, '');
	evalString += isJson ? ' ;' : '';
	evalString += '});';

	return evalString;
}

/**
 * Evaluate the extension and dependencies.
 * @param {Object} An object containing the extension and dependencies
 */
function evalModule (module) {
	module.dependencies.forEach(function (dep) {
		if (frameworkModules.indexOf(dep.moduleName) == -1) {
			/*jshint evil:true */
			eval(getDefineString(dep.moduleName, dep.body));
			/*jshint evil:false */
			frameworkModules.push(dep.moduleName);
		}
	});
	/*jshint evil:true */
	eval(getDefineString(module.moduleName, module.body));
	/*jshint evil:false */
	frameworkModules.push(module.moduleName);
}

/**
 * Retrieves the body text of the extension and the body text of ALL the dependencies.
 * IMPORTANT: The moduleName must normalized.
 * ie. extensions must be 'ext/<extension name>/<path to>/<filename without file extension>'
 *     libraries must be 'lib/<library name>/<path to>/<filename without extension>'
 *
 * @param {String} extension The extension name
 * @param {String} module The filename in the extension
 * @param {String} path The path to the native folder in the app
 * @returns {Object} The extension and normalized name with all dependencies and normalized names
 */
function getExtensionContent (extension, module, path) {
	var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
		cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
		xhr = new XMLHttpRequest(),
		deps = [],
		content = {},
		normalizedName = require.toUrl( "./" + module, "ext/" + extension + "/" + module);
	
	try {
		xhr.open("GET", path + "chrome/" + normalizedName, false);
		xhr.send();

		// get rid of all comments from client JS, parses out all require statements, for each require statement found
		// in client JS, push a JSON object (module path, module body) into the array
		// multi-level dependencies are not supported
		xhr.responseText.replace(commentRegExp, "").replace(cjsRequireRegExp, function (match, dependency) {
			var req = new XMLHttpRequest(),
				dependencyPath = require.toUrl( dependency, "ext/" + extension + "/" + module);

			req.open("GET", path + "chrome/" + dependencyPath, false);
			req.send();
			deps.push({
				"moduleName": dependencyPath,
				"body": req.responseText
			});
		});
		content = { "body": xhr.responseText, "moduleName": normalizedName, "dependencies": deps};

	} catch (e) {
		console.warn(e, "Failed to load extension " + normalizedName);
	}

	return content;
}

/**
 * Attemps to retrieve the list of framework modules (frameworkModules.js) created by the webwork's packager. 
 * @param {String} path The path to the 'native' folder
 * @returns {Object|null} 
 *
 * example path
 * 'local:///apps/carcontrol.testDev_carcontrol_21522f09/native/'
 *
 * example return object
 * {
 *		path: {String} <the path to the app's native folder>,
 *		extNames: {Array} [<the list of extensions for a specified app>],
 *		extPaths: {Array} [<the list of all files in the extension - not including dependencies>]
 * }
 *
 */ 
function getExtensionList (path) {
	var moduleArray = [];
		extensions = {}, 
		xhr = new XMLHttpRequest();
	
	try {
		xhr.open("GET", path + "chrome/frameworkModules.js", false);
		xhr.send();
		/*jshint evil:true */
		moduleArray = (eval((xhr.responseText).split("=")[1])).filter(isExtension); // only extension files
		/*jshint evil:false */
		extensions.path = path;
		extensions.extPaths = moduleArray;
		extensions.extNames = moduleArray.map(extensionName).filter(unique); // only unique extension names
	} catch (e) {
		extensions = null;
		console.warn(e, "Failed to load chrome/frameworkModules");
	}

	return extensions;
}

/**
 * Loads, evals and initializes the extensions in the specified path.
 * @param {Object} modules An object containing the app's extension details.
 * 
 * example
 * {
 *		path: {String} <the path to the app's native folder>,
 *		extNames: {Array} [<the list of extensions for a specified app>],
 *		extPaths: {Array} [<the list of all files in the extension - not including dependencies>]
 * }
 */
function loadWebviewExtensions (modules) {
	// for each extension file, load the content, wrap it in a 'define' function then eval.
	for (var i in modules.extPaths) {
		var target = modules.extPaths[i],
			extension = target.match(/.*[\\\/]/)[0].replace(/^(ext\/)/,'').replace(/\/$/, ''),
			file = target.replace(/^.*[\\\/]/, '').split('.')[0],
			module = getExtensionContent (extension, file, modules.path);

		if (frameworkModules.indexOf(module.moduleName) == -1) {
			evalModule(module);
		}
	}

	// after each file is defined, 'require' the index.  This executes initialization code.
	for (var j in modules.extNames) {
		require('ext/' + modules.extNames[j] + '/index');
	}
}

/**
 * Continues the loading sequence that was deferred by the application.
 * @param id {Number} The webview id
 */
function loadWebviewContent (id) {
	var webview = _webviews[id],
		args = webview.params;

	// URL's only ie. NOT package apps
	if (args.checkPreReqs && args.url) {
		var path = args.url.substring(0, args.url.indexOf('index')),
			modules = getExtensionList(path);

		// if the extension list can't be retrieved, this may be a native app.
		// Don't add a 'modules' object to the webview.  Without this addition,
		// webworks will not handle the webview's requests differently.
		if (modules !== null) {
			webview.modules = modules;
			// load, eval and initialize the webview's extensions in the controller.
			// The client side part will occur later.
			loadWebviewExtensions (webview.modules);
		}
	}

	args.checkPreReqs = false;

	if (args.url) {
		/* webview geometry is set here for URLs.  Alternatively, the geometry for webviews containing launched 
		 * packages is set after the app joins the container webview.
		 */
		webview.setGeometry(args.x, args.y, args.w, args.h);
		webview.url = args.url;

		var url = _utils.parseUri(args.url);
		if (_utils.isLocalURI(url)) {
			_appEvents.addLocalTrigger({key:webview.id, id:webview.params.id, windowGroup: screenWebviewGroup(webview.webviewHandle)});
		}
	} else {
		// loadString is not included in webplatform.js
		qnx.callExtensionMethod('webview.loadString', id, "<html><head><title>webviewId:" + id + "</title></head><body></body></html>");
	}
}

/**
 * Event handler for animation event finished 
 * @param animationId {Number} The animation id
 */
function onAnimationFinished (animationId) {
	console.log('animation complete ' + animationId);
}

/**
 * Event handler for webview created event.
 * The actual chrome.internal.webEvent 'Created' event is hidden by the webplatform
 * @param id {Number} The webview id
 */
function onWebviewCreated (id) {
	if (typeof _webviews[id] != "undefined") {
		var webview = _webviews[id],
			args = webview.params,
			requestObj =  resourceRequest.createHandler(webview);
		
		webkitOriginAccess.addWebView(webview);

		webview.visible = true;
		webview.active = false;
		webview.zOrder = args.z;
		webview.enableCrossSiteXHR = true;
		webview.executeJavaScript("1 + 1");
		webview.allowQnxObject = true;
		webview.webviewHandle = screenWindowHandle(id);
		webview.autoDeferNetworkingAndJavaScript = false;
		webview.onNetworkResourceRequested = requestObj.networkResourceRequestedHandler;
		webview.backgroundColor = 0x00FFFFFF;
		webview.sensitivity = "SensitivityTest";

		webview.addEventListener("DocumentLoadFinished", function (event) {
			if (_readyTrigger && typeof _readyTrigger === 'function') {
				_readyTrigger(webview);
			}
		});

		// if required to check for prerequesites through the bootmgr do not load webview content.
		if (typeof args.checkPreReqs != "undefined" && args.checkPreReqs) {
			qnx.callExtensionMethod('webview.loadString', id, "<html><head><title>webviewId: " + id + " (deferred)</title></head><body></body></html>");
		} else {
			loadWebviewContent(id);
		}
	}
}

/**
 * Returns the screen window handle for the specified id 
 * @param id {Number} The webview id
 * @returns {Number} The pointer of the window object managed by Screen
 */
function screenWindowHandle (id) {
	// jsScreenWindowHandle was not included in webplatform.js
	return qnx.callExtensionMethod("webview.jsScreenWindowHandle", id);
}

/**
 * Returns the screen webview group for the window handle 
 * @param windowHandle {Number} The window handle
 * @returns {String} The webview (window) group string that is managed by Screen
 */
function screenWebviewGroup (windowHandle) {
	return  JNEXT.invoke(JNEXT.JScreen.m_strObjId, "GetPropertyByPtr", windowHandle + " 18").split(" ")[2];
}

/**
 * Create the webview animation - other animations TBD
 * @param id {Number} The webview id
 */
function webviewAnimation (id) {
	// animations were not included in webplatform.js
	var animationId = qnx.callExtensionMethod("windowAnimations.animateGlobalAlpha", _webviews[id].webviewHandle, "Linear", "0.3", "155", "255");
	qnx.callExtensionMethod("windowAnimations.startAnimation", animationId);
	return animationId;
}

/**
 * Dispatches the webview error event
 */
function dispatchWebviewError () {
	if (_errorTrigger && typeof _errorTrigger === 'function') {
		_errorTrigger({error:"error creating webview"});
	}
}

/**
 * Exports are the publicly accessible functions
 */
module.exports = {

	/**
	 * Initializes the animation finished event
	 */
	init: function () {
		if (typeof chrome.internal == "object") {
			chrome.internal.windowAnimations = {};
			chrome.internal.windowAnimations.onWindowAnimationFinished = onAnimationFinished;
		}
	},

	/**
	 * Creates the webview through the webplatform.js module provided by the webworks framework
	 * @param args {Object} Webview parameters
	 * Ex: {
	 *		url: [optional],
	 *		x: <left>,
	 *		y: <top>,
	 *		w: <width>,
	 *		h: <height>,
	 *		z: <zOrder>
	 *  }
	 * @returns id {Number} The webviews ID
	 */
	create: function (args) {
		// With the webplatform.js layer, the 'onCreated' callback does not reference the webview id.
		// We create an object and save the params for reference on that callback. 
		var process = (args.outprocess === true) ? ++_process : 0,
			webviewObj = window.qnx.webplatform.createWebView( {processId: process}, function () {
				onWebviewCreated(webviewObj.id);
			}); 

		if (webviewObj.id != -1) {
			// save the args before the 'onCreated' event
			webviewObj.params = args;
			if (args.process === true) {
				webviewObj.params.process = process;
			}

			_webviews[webviewObj.id] = webviewObj;
		} else {
			dispatchWebviewError();
		}
		return webviewObj.id;
	},

	/**
	 * Destroys the webview 
	 * @param id {Number} The webview ID
	 */
	destroy: function (id) {
		_webviews[id].destroy(function () {
			if (_destroyedTrigger && typeof _destroyedTrigger === 'function') {
				_destroyedTrigger({id: id});
			}
			delete _webviews[id];
		}); 
		return true;
	},

	/**
	 * Selects the webview by changing the z-order and visibility
	 * @param id {Number} The webview ID
	 * @returns history {Object} The current and previous webviews 
	 */
	select: function (id) {

		if (typeof _webviews[id] == "undefined") {
			return -1;
		}

		var selected = Object.keys(_webviews).reduce(function (previous, current) {
				var webview = _webviews[current];
				return (webview.zOrder === "0") ? webview : previous;
			}, null);

		// on first select
		if (selected === null) {
			selected = _webviews[id];
			_webviews[id].zOrder = 0;
			_webviews[id].visible = true;
		} 

		// store the history before making the switch
		_prevWebview = _webviews[selected.id];
		_currWebview = _webviews[id];
		
		if (id == selected.id) {
			console.log('currently selected.' );
			_webviews[id].zOrder = 0;
		} else {
			// animate the transition
			//webviewAnimation(id);

			_webviews[id].zOrder = 0;
			// should test for visible then set but the test doesn't work (PR:239406)
			_webviews[id].visible = true;
			_webviews[selected.id].zOrder = -99;
		}
		return {current: _currWebview.id, previous: _prevWebview.id};
	},

	/**
	 * Sets the trigger function to call when a webview created event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setCreatedTrigger: function(trigger) {
		_readyTrigger = trigger;
	},

	/**
	 * Sets the trigger function to call when a webview destroyed event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setDestroyedTrigger: function(trigger) {
		_destroyedTrigger = trigger;
	},

	/**
	 * Sets the webview zorder
	 * @param id {Number} The webview ID
	 * @param value {Number} The zorder. Negative values are hidden. 
	 */
	setZOrder: function (id, value) {
		_webviews[id].zOrder = value;
	},
	
	/**
	 * Sets the webview visibility
	 * @param id {Number} The webview ID
	 * @param value {Boolean} true|false 
	 */
	setVisible: function (id, value) {
		_webviews[id].visible = value;
	},
   
	/**
	 * Sets the webview geometry.
	 * @param id {Number} The webview ID
	 * @param args {Object} The x,y (top,left) coordinates and the width & height 
	 */
	setGeometry: function (id, args) {
		_webviews[id].setGeometry(args.x, args.y, args.w, args.h);
	},

	/**
	 * Sets the webview's URL.
	 * @param id {Number} The webview ID
	 * @param url {String} The URL to load 
	 */
	setURL: function (id, url) {
		_webviews[id].url = url;
	},

	/**
	 * Gets the webview geometry.
	 * @param id {Number} The webview ID
	 */
	getGeometry: function (id) {
		return {x:_webviews[id].params.x, 
				y:_webviews[id].params.y,
				w:_webviews[id].params.w,
				h:_webviews[id].params.h};
	},

	/**
	 * Gets the webview object
	 * @param id {Number} The webview ID
	 * @returns webview {Object} The webview object
	 */
	getById: function (id) {
		return _webviews[id];
	},

	/**
	 * Gets the webview object
	 * @param appId {String} The applications ID string
	 * @returns webview {Object} The webview object
	 */
	getByAppId: function (appId) {
		return Object.keys(_webviews).reduce(function (previous,current) {
				var webview = _webviews[current];
				return (webview.params.id === appId) ? webview : previous;
		}, null);
	},
	
	/**
	 * Gets the webview object
	 * @param packageName {String} The webview packageName
	 * @returns webview {Object} The webview object
	 */
	getByPackageName: function (packageName) {
		return Object.keys(_webviews).reduce(function (previous,current) {
				var webview = _webviews[current];
				return (webview.params.packageName === packageName) ? webview : previous;
		}, null);
	},

	/**
	 * Gets the webview object
	 * @param key {String} The webview key
	 * @returns webview {Object} The webview object
	 */
	getByPid: function (pid) {
		return Object.keys(_webviews).reduce(function (previous,current) {
				var webview = _webviews[current];
				return (webview.pid === pid) ? webview : previous;
		}, null);
	},

	/**
	 * Sets the webview objects process id
	 * @param pid {String} The pid of the process associated with this webview
	 */
	setPid: function (id, pid) {
		_webviews[id].pid = pid;
	},
	
	/**
	 * Gets the a list of names of the current webviews
	 * @returns {Object} A collection of webviews. 
	 */
	getList: function () {
		return _webviews;
	},

	/**
	 * Returns the webviews screen window group.
	 * @param id {Number} The webviews numeric id.
	 * @returns windowGroup {String} The Screen window group name for the webview.  
	 */
	getWebviewGroup: function (id) {
		var windowHandle = screenWindowHandle(id),
			webviewGroup = screenWebviewGroup(windowHandle);
			
		return webviewGroup;
	},

	/**
	 * Continues the loading sequence that was deferred in 'start'. 
	 * @param id {Number} The webviews numeric id.
	 */
	loadDeferred: function (id) {
		loadWebviewContent(id);
	},

	/**
	 * Continues the loading sequence that was deferred in 'start'.
	 * @param group {Array} An array of application Id's 
	 */
	loadDeferredGroup: function (group) {
		for (var i=0; i<group.length; i++) {
			var webview = this.getByAppId(group[i]);

			if (webview) {
				loadWebviewContent(webview.id);
			}
		}
	}
};
