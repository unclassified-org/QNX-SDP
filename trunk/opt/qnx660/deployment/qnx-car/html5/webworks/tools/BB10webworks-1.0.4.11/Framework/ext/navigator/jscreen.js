/**
* The abstraction layer for jscreen functionality
 *
 * @author dkerr
 * $Id: jscreen.js 4333 2012-09-27 20:41:20Z dkerr@qnx.com $
 */

var _screenUtils = require("../../lib/screen/screenUtils"),
	_trigger,
	_jscreenObj;

/**
 * Function to handle window created events triggered by jscreen
 * @param event {Object} The jscreen event
 * Ex. {
 *	  customData: {Number} The process id of the app the has created a window
 * }
 */
function onWindowCreatedEvent(event) {
	if (_trigger && event && event.customData) {
		_trigger({pid: event.customData});
	}
}

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	
	/**
	 * Initializes the jscreen object. 
	 * Can only be done once per jscreen.so instance.
	 * Must be initialized after the extension is loaded. 
	 */
	init: function() {
		_jscreenObj = _screenUtils.createObject();
		_jscreenObj.init();
		_jscreenObj.connect();
		_jscreenObj.addEventListener("OnWindowCreated", onWindowCreatedEvent);
	},

	/**
	 * Joins the window identified by pid to the webview identified by the screen window group.
	 * @param pid {Number} The process id.
	 * @param webviewGroup {String} The name of the webview's group registered with Screen
	 * @returns result {String} Returns Ok, if successful; Error, if unsuccessful  
	 */
	join: function(pid, webviewGroup) {
		return JNEXT.invoke(JNEXT.JScreen.m_strObjId, "JoinGroup", pid + " " + webviewGroup).split(" ")[0];
	},

	/**
	 * Modifies the zOrder of the window identified by pid.
	 * @param pid {Number} The process id.
	 * @param zOrder {String} The zOrder of the jscreen managed window.
	 * @returns result {String} Returns Ok, if successful; Error, if unsuccessful  
	 */
	zOrder: function (pid, zOrder) {
		var z = (zOrder == "undefined") ? 1 : zOrder;
		return JNEXT.invoke(JNEXT.JScreen.m_strObjId, "SetProperty", pid + " 54 " + z).split(" ")[0];
	},

	/**
	 * The external app will have default dimensions (ie. screen.width and screen.height).  This function will
	 * either scale the window to the width & height or crop the viewport to the width & height.
	 * @param pid {Number} The process id
	 * @param width {Number} The desired width 
	 * @param height {Number} The desired height 
	 */
	resize: function(pid, width, height, scale) {
		console.log("jscreen.resize() ", pid, width, height, scale);
		if (scale === true) {
			return JNEXT.invoke(JNEXT.JScreen.m_strObjId, "SetProperty", pid + " 40 " + width + " " + height).split(" ")[0]; // crop size
		} else {
			var result, rc1, rc2;
			// Requires an experimental Jscreen plugin - fixes the visual window squish 
			rc1 = JNEXT.invoke(JNEXT.JScreen.m_strObjId, "SetProperty", pid + " 92 " + width + " " + height).split(" ")[0]; // crop size
			rc2 = JNEXT.invoke(JNEXT.JScreen.m_strObjId, "SetProperty", pid + " 75 " + width + " " + height).split(" ")[0]; // viewport size
		
			result = (rc1 === "Ok" && rc2 === "Ok") ? "Ok" : "Error";
			return result;
		}
	},

	/**
	 * Sets the trigger function to call when a jscreen event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setTrigger: function(trigger) {
		_trigger = trigger;
	}
};