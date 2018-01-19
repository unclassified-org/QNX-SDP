/**
* The abstraction layer for overlay utilties
 *
 * @author dkerr
 * $Id: overlay.js 4612 2012-10-16 17:27:19Z dkerr@qnx.com $
 */

var _overlayWebview = {},
	_networkResourceRequested = require("../../lib/webkitHandlers/networkResourceRequested"),
	_webkitOriginAccess = require("../../lib/policy/webkitOriginAccess"),
	_utils = require("lib/utils");

function overlayVoiceCancel() {
	var voiceExt = _utils.loadExtensionModule("voice", "voice"),
		args = {state:'cancelling...'};

	_overlayWebview.executeJavaScript('jQuery.voiceUpdate(' + JSON.stringify(args) + ')');
	voiceExt.cancel();
}

/**
 * Exports are the publicly accessible functions
 */
module.exports = {

	init: function (url, args) {
		console.log(url);

		var localArgs = (typeof args != "undefined") ? args : {x:0, y:0, w:screen.width, h:screen.height};

		_overlayWebview = window.qnx.webplatform.createWebView(function (e) {

            //Create webkit event handlers
            var requestObj =  _networkResourceRequested.createHandler(_overlayWebview);

            //Bind networkResourceRequested event so that everything works
            _overlayWebview.onNetworkResourceRequested = requestObj.networkResourceRequestedHandler;
            _webkitOriginAccess.addWebView(_overlayWebview);
			_overlayWebview.visible = true;
			_overlayWebview.backgroundColor = "0x00FFFFFF";
			_overlayWebview.active = false;
			_overlayWebview.zOrder = 1;
			_overlayWebview.enableCrossSiteXHR = true;
			_overlayWebview.executeJavaScript("1 + 1");
			_overlayWebview.setGeometry(localArgs.x, localArgs.y, localArgs.w, localArgs.h);
			_overlayWebview.sensitivity = "SensitivityTest";
            _overlayWebview.autoDeferNetworkingAndJavaScript = false;
            _overlayWebview.allowQnxObject = true;


			_overlayWebview.url = url;
			_overlayWebview.addEventListener('JavaScriptCallback', function (value) {
				var valuesObj = eval("(" + value + ")");
				if (valuesObj.numArgs == 4 && (valuesObj.args[2].indexOf("overlayVoiceCancel" != -1))) {
					try {
						eval(valuesObj.args[2]);
					} catch (e) {
						console.error("Error during invocation of: " + valuesObj.args[2]);
					}
				}
			});

		});

	},

	/**
	 * Displays the voice bar UI element
	 */
	showVoice: function () {
		_overlayWebview.executeJavaScript('jQuery.voiceShow();');
	},
	
	/**
	 * Hides the voice bar UI element
	 */
	hideVoice: function () {
		_overlayWebview.executeJavaScript('jQuery.voiceHide();');
	},
	
	/**
	 * Adds to the text fields of the voice bar UI element.
	 * The fields are: voiceState, voiceUtterance, and voiceConfidence
	 */
	updateVoice: function (args) {
		_overlayWebview.executeJavaScript('jQuery.voiceUpdate(' + JSON.stringify(args) + ')');
	},
	
	/**
	 * Displays a 'notice' UI element
	 */
	showNotice: function (args) {
		// TODO generate and return an id
		_overlayWebview.executeJavaScript('jQuery.noticeAdd(' + JSON.stringify(args) + ')');
	},
	
	/**
	 * Removes a 'notice' UI element
	 */
	hideNotice: function (id) {
		// TODO the current implementation does not need an id but this would be good to have for future-proofing
		// ex: _overlayWebview.executeJavascript('jQuery.noticeRemove($(\".notice-item-wrapper-' + id + '\"))');
	},
	
	/**
	 * Displays the info UI element
	 */
	showInfo: function (args) {
		// TODO add args
		_overlayWebview.executeJavaScript('jQuery.infoShow();');
	},
	
	/**
	 * Removes the info UI element
	 */
	hideInfo: function () {
		_overlayWebview.executeJavaScript('jQuery.infoHide()');
	},

	/**
	 * Displays the cover UI element
	 */
	showCover: function (args) {
		_overlayWebview.executeJavaScript('jQuery.coverShow();');
	},
	
	/**
	 * Removes the cover UI element
	 */
	hideCover: function () {
		_overlayWebview.executeJavaScript('jQuery.coverHide()');
	}
};