/**
 * Implementation of Keyboard service
 * */
var _networkResourceRequested = require("../../lib/webkitHandlers/networkResourceRequested"),
	_webkitOriginAccess = require("../../lib/policy/webkitOriginAccess"),
	_event = require("../../lib/event"),
	_pps = require('../../lib/pps/ppsUtils'),
	_wwfix = require("../../lib/wwfix"),
	_controlPPS,
	_statusPPS,
	_appLaunchPPS,
	_settings;

/**
 * Initialises the extension, creates PPS object and setup listeners
 * @param settings {Objejct} object representing keyboard settings
 * Ex: {
*		x:0,
		y:0,
		width:800,
		height:190,
		screenWidth:800,
		screenHeight:480
 * }
 * */
function init(settings) {
	try {
		_settings = settings;

		_statusPPS = _pps.createObject();
		_statusPPS.init();
		_statusPPS.open("/pps/system/keyboard/status", JNEXT.PPS_RDWR_CREATE);

		_controlPPS = _pps.createObject();
		_controlPPS.init();
		_controlPPS.onChange = onKeyboardEvent;
		_controlPPS.open("/pps/system/keyboard/control", JNEXT.PPS_RDWR_CREATE);

		if (_settings && typeof _settings.width !== undefined
			&& typeof _settings.height !== undefined && typeof _settings.screenHeight !== undefined
			&& typeof _settings.screenWidth !== undefined
			&& typeof _settings.x !== undefined && typeof _settings.y !== undefined) {
			// create overlay which has dimensions of the keyboard and position defined by client
			createOverlay({x:_settings.x, y:_settings.y, w:_settings.width, h:_settings.height}, 'local:///keyboard-overlay/index.html');
		} else {
			var err = 'qnx.keyboard.overlay::init [index.js] Missing one or mode fields in settings object';
			console.error(err);
			throw new Error(err);
		}
	} catch (ex) {
		console.error('Error in webworks ext: keyboard.overlay/index.js:init():', ex);
	}
}

/**
 * Global keyboard overlay webView object
 * */
var _overlayWebView = {};

/**
 * Creates keyboard overlay, set all necessary priorities for the webview
 * @param args {Object} a set of arguments
 * Ex:
 * {
 * 	x:0,
 * 	y:480,
 * 	w:800,
 * 	h:190
 * }
 * @param url {String} URL of the overlay
 * */
function createOverlay(args, url) {
	_overlayWebView = window.qnx.webplatform.createWebView(function (e) {
        //Create webkit event handlers
        var requestObj =  _networkResourceRequested.createHandler(_overlayWebView);

        //Bind networkResourceRequested event so that everything works
        _overlayWebView.onNetworkResourceRequested = requestObj.networkResourceRequestedHandler;
        _webkitOriginAccess.addWebView(_overlayWebView);
		_overlayWebView.visible = false;
		_overlayWebView.active = false;
		_overlayWebView.zOrder = 4;
		_overlayWebView.enableCrossSiteXHR = true;
		_overlayWebView.executeJavaScript("1 + 1");
		_overlayWebView.setGeometry(args.x, args.y, args.w, args.h);
		_overlayWebView.sensitivity = "SensitivityNoFocus";
		_overlayWebView.allowQnxObject = true;
        _overlayWebView.autoDeferNetworkingAndJavaScript = false;

		_overlayWebView.url = url;
		_overlayWebView.addEventListener('JavaScriptCallback', function (value) {
			var valuesObj = eval("(" + value + ")");
			if (valuesObj.numArgs == 4 && (valuesObj.args[2].indexOf("keyPressChar" != -1) || valuesObj.args[2].indexOf("keyPressCode" != -1))) {
				try {
					eval(valuesObj.args[2]);
				} catch (e) {
					console.error("Error during invocation of: " + valuesObj.args[2]);
				}
			}
		});

		onWebviewCreated(_overlayWebView);
	});
}

/**
 * To do some extra job when keyboard overlay is created
 * */
function onWebviewCreated() {
}

/**
 *  PPS event change handler. Will intercept request to show hide keyboard as well as any other messages incoming from clients
 *  @param ppsEvent (Object) contains pps event data
 *  Ex:
 *	data: {
 *  	 msg:hide,
 *  	 id:1,
 *  	 dat:''
 *  }
 * */
function onKeyboardEvent(ppsEvent) {
	if (ppsEvent && ppsEvent.changed.msg && ppsEvent.data.msg == 'show') {
		controlReply(ppsEvent.data.msg, ppsEvent.data.id, null);
		show()
	}

	if (ppsEvent && ppsEvent.changed.msg && ppsEvent.data.msg == 'hide') {
		controlReply(ppsEvent.data.msg, ppsEvent.data.id, null);
		hide();
	}

	if (ppsEvent && ppsEvent.changed.msg && ppsEvent.data.msg == 'setOptions') {
		controlReply(ppsEvent.data.msg, ppsEvent.data.id, null);
	}

	if (ppsEvent && ppsEvent.changed.msg && ppsEvent.data.msg == 'setSettings') {
		controlReply(ppsEvent.data.msg, ppsEvent.data.id, null);
	}
}

/**
 * Will show overlay on the screen
 * Write all necessary status indications to status pps object
 * */
function show() {
	_overlayWebView.visible = true;
	_overlayWebView.active = true;
	// reports in PPS that it is displayed
	// browser care only about height, se we going to report height of the keyboard only
	if (_settings && _settings.height) {
		_statusPPS.write({visible:true, size:_settings.height});
	}
}

/**
 * Will hide overlay from the screen
 * Write all necessary status indications to status pps object
 * */
function hide() {
	_overlayWebView.visible = false;
	_overlayWebView.active = false;

	// reports in PPS that it is hidden
	_statusPPS.write({visible:false, size:0});
}

/**
 * Will create reply (res) message and write to control obejct
 * @param message (String) Messages string
 * @param id {String} Message id
 * @param data (Object) Message payload
 * */
function controlReply(mesage, id, data) {
	if (mesage && id) {
		_controlPPS.write({res:mesage, dat:data, id:id });
	}
}


/**
 * Will send symbol to the control object
 * @param symbol (String) A single character will sent to the keyboard client input field
 * */
function keyPressChar(symbol) {
	if (symbol) {
		if (this.capsLock) {
			symbol = symbol.toUpperCase();
		}

		var charcode = symbol.charCodeAt(0);
		_controlPPS.write({msg:"key", dat:{keysym:charcode}});
	} else {
		console.error("Error, symbol is no specifies");
	}
}

/**
 * Will send character code to the control object
 * @param code (String) Character code will sent to the keyboard client input field
 * */
function keyPressCode(code) {
	if (code && !isNaN(code)) {
		_controlPPS.write({msg:"key", dat:{keysym:code}});
	} else {
		console.error("Error, code is no specifies or not a valid Number");
	}
}

module.exports = {
	/**
	 * Sets the overlayWebview object to the URL specified
	 */
	init:function (success, fail, args, env) {
		try {
			var args = _wwfix.parseArgs(args);
			init(args.settings);
			success();
		} catch (e) {
			fail(-1, e);
		}
	}
};