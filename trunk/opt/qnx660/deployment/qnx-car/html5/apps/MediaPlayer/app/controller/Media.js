/**
 * The controller responsible for shared multimedia functionality
 * @author mlapierre
 *
 * $Id: Media.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.controller.Media', {
	extend: 'Ext.app.Controller',
	
	/**
	 * Formats a duration into a user readable format
	 * Ex: 60 => 1:00
	 * @param s The duration in seconds
	 * @returns The duration in common time
	 */
	formatDuration: function(s) {
		if (s == null || s <= 0) {
			return "0:00";
		}

		var out = "";	
		s = Math.floor(s);

		var h = Math.floor(s / 3600);
		if (h > 0) {
			s -= h * 3600;
			out = h + ":";
		}

		var m = Math.floor(s / 60);
		if (m > 0) {
			s -= m * 60;
			if (m < 10 && h > 0) {
				out += "0";
			}
			out += m + ":";
		} else if (h > 0) {
			out += "00:"
		} else {
			out = "0:";
		}

		if (s < 10) {
			out += "0";
		}

		out += s;
		return out;
	},
});
