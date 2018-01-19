/**
 * Contains methods to fix webworks issues 
 *
 * @author mlapierre
 * $Id: wwfix.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

module.exports = {
	
	/**
	 * Fixes the issue where arguments all come in as strings, still with
	 * URI encoding, and encoded to JSON
	 * @param args {Object} The collection of arguments
	 * @returns {Object} A copy of the args object, properly typed and cleanued up
	 */
	parseArgs : function (args) {
		try {
			if (args && Object.keys(args).length > 0) {
				var out = {};
				for (var i in args) {
					// Prune undefined arguments
					if(args[i] === 'undefined') {
						delete args[i]; 
					} else {
						//decode uri vars, because webworks doesn't	
						//and we need to JSON.parse it because webworks calls JSON.stringify
						out[i] = JSON.parse(decodeURIComponent(args[i]));
					}
				}
				return out;
			} else {
				return args;
			}
		} catch (e) {
			console.log('parseArgs error', e);
			return args;
		}
	}
};
