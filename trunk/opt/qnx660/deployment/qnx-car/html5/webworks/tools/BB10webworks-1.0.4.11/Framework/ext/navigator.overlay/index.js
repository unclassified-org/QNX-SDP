/**
 * Allows access to the ui resources on the overlay webview
 *
 * @author dkerr
 * $Id: index.js 4333 2012-09-27 20:41:20Z dkerr@qnx.com $
 */

var _wwfix = require("../../lib/wwfix"),
	_overlay = require("./overlay");

/**
 * Exports are the publicly accessible functions
 */
module.exports = {

	/**
	 * Sets the overlayWebview object to the URL specified 
	 */
	init: function(success, fail, args, env) {
		try {
			var args = _wwfix.parseArgs(args);
			_overlay.init(args.url, args.dim);
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Displays the UI element specified by the type key in the arguments.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: 
	 * voice Ex:
	 *   {
	 *	  type: {String}, // 'voice' the type of UI element
	 *	  opts: {Object} {
	 *		  state: {String}, //time required to navigate the entire route, in seconds
	 *	  }
	 *  }
	 * voice Ex:
	 *   {
	 *	  type: {String}, // 'voice' the type of UI element
	 *	  opts: {Object} {
	 *		  results: {Object} {
	 *			  utterance: {String},
	 *			  confidence: {Number}
	 *		  } 
	 *	  }
	 *  }
	 * notice Ex:
	 *   {
	 *	  type: {String}, //  'notice' the type of UI element
	 *	  opts: {Object} {
	 *		  text: {String}, // the text contained within the notice
	 *		  title: {String}, // the title of the notice
	 *		  stay: {Boolean}, // if true, the notice must be dismissed by touch
	 *		  stayTime: {Time}, // in milliseconds
	 *		  klass: {String}, // optional class for css styling ie. notice, error, success
	 *	  }
	 *  }
	 * @param env {Object} Environment variables
	 */
	show: function(success, fail, args, env) {
		try {
			var args = _wwfix.parseArgs(args);
			switch (args.type) {
				case 'voice':
					if (typeof args.state != "undefined" || typeof args.result != "undefined") {
						success(_overlay.updateVoice(args));
					} else {
						success(_overlay.showVoice());
					}
					break;
				case 'info':
					success(_overlay.showInfo(args));
					break;
				case 'notice':
					success(_overlay.showNotice(args));
					break;
				case 'cover':
					success(_overlay.showCover());
					break;
				default:
					fail(-1, 'invalid type');
			}
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Displays the UI element specified by the type key in the arguments.
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are: id
	 * @param env {Object} Environment variables
	 */
	hide: function(success, fail, args, env) {
		try {
			var args = _wwfix.parseArgs(args);
			switch (args.type) {
				case 'voice':
					success(_overlay.hideVoice(args.id));
					break;
				case 'info':
					success(_overlay.hideInfo(args.id));
					break;
				case 'notice':
					success(_overlay.hideNotice(args.id));
					break;
				case 'cover':
					success(_overlay.hideCover());
					break;
				default:
					fail(-1, 'invalid type');
			}
		} catch (e) {
			fail(-1, 'fail ' + e);
		}
	}
};
