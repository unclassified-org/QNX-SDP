/**
 * Class manage system updates
 * <p>You can check for updates using <code>checkForUpdate()</code> function or perform update using <code>performUpdate</code>.</p>
 *
 * <h3>Events</h3>
 * <dl><dt><h4>systemupdateavailable</h4></dt>
 * <dd><p>Fired when a new update is available or when you Asynchronously check for update</p>
 * <h5>Example</h5>
 *<pre><code>{
 *      updateAvailable:{Boolean},          //indicated if update is available or not. If updateAvailable:false, the <code>updateDetails</code> field will not be populated
 *      updateDetails:  {
 *          "sourceVersion":{String},       // source version of the software update
 *          "targetVersion":{String},       // target version of the software update
 *          "source":{Number}               // indicates the source of the update
 *                      },
 *      updateError:{String}                // Send messages about errors that occur to print on HMI [Optional]
 *}</code></pre></dd></dl>
 *
 * @module qnx_xyz_systemupdate
 */
 
/* 
 * @author mlytvynyuk
 * $Id: client.js 4582 2012-10-11 19:59:26Z mlapierre@qnx.com $
 */

var _ID = require("./manifest.json").namespace;

/*
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Check for a new software update
	 * Will initiate a check for new updates in <code>updateMgr</code>; result will be systemupdateavailable event
	 * Asynchronous function
	 */
	checkForUpdate : function() {
		window.webworks.execAsync(_ID, 'checkForUpdate');
	},

	/**
	 * Initiate update to the latest available software.
	 * Sends command to the updateMgr to start update procedure.
	 * Will proceed with software update procedure, and reboot the system in order to boot in update IFS
	 * Asynchronous function
	 */
	performUpdate : function() {
		window.webworks.execAsync(_ID, 'performUpdate');
	}
};
