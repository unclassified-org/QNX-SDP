/**
 * The abstraction layer for launcher functionality
 *
 * @author dkerr
 * $Id: launcher.js 4545 2012-10-09 15:55:06Z dkerr@qnx.com $
 */

var _ppsUtils = require("../../lib/pps/ppsUtils"),
	_webviews = require("./webviews").
	_launcherCtrlPPS = {},
	_trigger;

/**
 * Function to handle events from the launcher (server) object
 * @param event {Object} The launcher event
 * Ex. {
 *	  changed: {
 *		  dat: {Boolean},
 *		  id: {Boolean},
 *		  res: {Boolean}
 *	  },
 *	  data: {
 *		  dat: {Number}, // The process id
 *		  id: {String}, // the app id as described by the filesystem
 *		  res: {String} // the command: start, stop, createsandbox etc.
 *	  },
 * }
 */
function onLauncherChange (event) {
	console.log("onLauncherChange ", JSON.stringify(event));
	if (_trigger && typeof _trigger === 'function') {
	   _trigger(event);
	}
}

/**
 * Exports are the publicly accessible functions
 */
module.exports = {

	/**
	 * Opens the launcher control server object.
	 * Must be openned in RDWR mode to receive server messages.
	 */
	init: function () {
		_launcherCtrlPPS = _ppsUtils.createObject();
		_launcherCtrlPPS.init();
		_launcherCtrlPPS.onChange = onLauncherChange;
		_launcherCtrlPPS.open("/pps/services/launcher/control", JNEXT.PPS_RDWR);
	},

	/**
	 * Starts the application specified by key
	 * @param key {String} The key string.  Corresponds to an id in applications PPS object and the name of the app in the filesystem.
	 * @returns {Boolean}   
	 * @param id {Number} The webview id.
	 * @param width {Number} The webview width.
	 * @param height {Number} The webview height. 
	 */
	start: function (key, id, width, height) {
		_launcherCtrlPPS.write({msg:"start",dat:key+",WIDTH="+width+",HEIGHT="+height,id:id});
	},

	/**
	 * Stops the application specified by pid
	 * @param pid {Number} The process id
	 */
	stop: function (pid) {
		_launcherCtrlPPS.write({msg:"stop",dat:pid});
	},

	/**
	 * Sets the trigger function to call when a webview ready event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setTrigger: function(trigger) {
		_trigger = trigger;
	},

};