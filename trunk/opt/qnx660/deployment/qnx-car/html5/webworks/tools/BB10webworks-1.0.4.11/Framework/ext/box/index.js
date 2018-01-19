/**
 * Implementation of box service
 *
 * @author mlytvynyuk
 * $Id:$
 * */
var _wwfix = require("../../lib/wwfix"),
	_utils = require("./../../lib/utils"),
	_box = require("./box");
/**
 * Initializes the extension
 */
function init() {
	try {
		_box.init();
	} catch (ex) {
		console.error('Error in webworks ext: box/index.js:init():', ex);
	}
}

init();

module.exports = {
	/**
	 * First step of OAuth2, redirects user to box.com page which allows user to login,
	 * and allow Test Track application to access his account
	 * @param {Function} success Function to call if the operation is a success
	 * @param {Function} fail Function to call if the operation fails
	 * @param {Object} args The arguments supplied. Available arguments for this call are:
	 * {
	 *         clientId: {String},
	 *         clientSecret: {String}
	 * }
	 * @param {Object} env Environment variables
	 */
	authorise: function(success, fail, args, env) {
		debugger;
		args = _wwfix.parseArgs(args);
		try {
			_box.authorise(args.clientId, args.clientSecret);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Function starts download of specified bar file then install downloaded bar files
	 * @param {Function} success Function to call if the operation is a success
	 * @param {Function} fail Function to call if the operation fails
	 * @param {Object} args The arguments supplied. Available arguments for this call are:
	 * {
	 *      id: {String}
	 * }
	 * @param {Object} env Environment variables
	 */
	install: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(_box.install(args.id));
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Function starts uninstallation of specified application
	 * @param {Function} success Function to call if the operation is a success
	 * @param {Function} fail Function to call if the operation fails
	 * @param {Object} args The arguments supplied. Available arguments for this call are:
	 * {
	 *     name:{String}
	 * }
	 * @param {Object} env Environment variables
	 */
	uninstall: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(_box.uninstall(args.name));
		} catch (e) {
			fail(-1, e);
		}
	}
};