/**
 * @module qnx_xyz_power
 * @description Allow access to power manager services
 *
 */

/*
 * @author mlytvynyuk
 * $Id: client.js 5102 2012-11-19 18:34:32Z phargrav@rogers.com $
 */

var _ID = require("./manifest.json").namespace;

/*
 * Exports are the publicly accessible functions
 */
module.exports = {

	/**
	 * Send the shutdown command to the service
	 * @param  {String} reason Reason for shutdown reason
	 * @param  {String} fast 1 - fast shutdown without logging, 0 - slow with logging
	 */
	shutdown:function (reason, fast) {
		return window.webworks.execAsync(_ID, 'shutdown', {
			reason:reason,
			fast:fast
		});
	},

	/**
	 * Send the reboot command to the service
	 * @param {String} reason Reboot reason
	 * @param {String} fast 1 - fast reboot without logging, 0 - slow with logging
	 */
	reboot:function (reason, fast) {
		return window.webworks.execAsync(_ID, 'reboot', {
			reason:reason,
			fast:fast
		});
	}
};