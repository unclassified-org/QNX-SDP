/**
 * The abstraction layer for profile functionality
 *
 * @author mlapierre
 * $Id: profile.js 4287 2012-09-26 13:28:57Z edagenais@lixar.com $
 */

var	_pps = require('../../lib/pps/ppsUtils'),
	_sqlite = require("../../lib/sqlite"),
	_db,
	_readerPPS,
	_writerPPS,
	_triggerUpdate;

const SELECT_PROFILE_QUERY = "SELECT id, full_name AS name, avatar, theme, device_id AS bluetoothDeviceId FROM profiles ";

/**
 * Returns the full profile for a given profile id
 * @param {Number} profileId The profile id to find
 * @return {Object} The full profile object for the given profile id, or null if it doesn't exist
 */
function getProfile(profileId) {
	//validate the profile id
	if (typeof profileId !== 'number' || profileId <= 0) {
		return null;
	}

	var query = SELECT_PROFILE_QUERY + "WHERE id={0}".format(profileId);
	var results = _sqlite.resultToArray(_db.query(query));

	return (results && results.length == 1) ? results[0] : null;
}

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Initializes the extension 
	 */
	init: function() {
		//readerPPS
		_readerPPS = _pps.createObject();
		_readerPPS.init();
		_readerPPS.onChange = function(event) {
			if (_triggerUpdate && event && event.data) {
				_triggerUpdate(event.data);
			}
		};
		_readerPPS.open("/pps/qnxcar/profile/user", JNEXT.PPS_RDONLY);

		//writerPPS
		_writerPPS = _pps.createObject();
		_writerPPS.init();
		_writerPPS.open("/pps/qnxcar/profile/user", JNEXT.PPS_WRONLY);

		_db = _sqlite.createObject();
		if (!_db || !_db.open("/dev/qdb/personalization"))
		{
			throw "lib/personalization::init [personalization.js] Error opening db; path=/dev/qdb/personalization";
		}
	},
	
	/**
	 * Sets the trigger function to call when an event is fired
	 * @param {Function} trigger The trigger function to call when an event is fired
	 */
	setTriggerUpdate: function(trigger) {
		_triggerUpdate = trigger;
	},
	
	/**
	 * Retrieves the current profile information
	 * @returns {Object} The requested user object
	 */
	getActive: function() {
		return getProfile(_readerPPS.ppsObj.id);
	},
	
	/**
	 * Change the active profile
	 * @param {Number} profileId The id of the profile to make active
	 */
	setActive: function(profileId) {
		var profile = getProfile(profileId);
		_writerPPS.write(profile);
	},

	/**
	 * Return a list of available profiles
	 * @return {Array} An array of profiles
	 */
	getList: function() {
		var results = _sqlite.resultToArray(_db.query(SELECT_PROFILE_QUERY));
		return results;
	},

	/**
	 * Create a new profile
	 * @param {String} name The name of the profile
	 * @param {String} avatar (Optional) The avatar for the profile
	 * @param {String} theme (Optional) The preferred theme for the profile
	 * @param {String} bluetoothDeviceId (Optional) The preferred Bluetooth device for the profile
	 * @return {Number} ID of the last row entered in the profiles table
	 */
	addProfile: function(name, avatar, theme, bluetoothDeviceId) {
		//insert the user
		var insertQuery = "INSERT INTO profiles(full_name, theme, avatar, device_id) VALUES ('{0}', '{1}', '{2}', '{3}')";
		_db.query(insertQuery.format(_sqlite.sqlSafe(name), _sqlite.sqlSafe(theme), _sqlite.sqlSafe(avatar), bluetoothDeviceId || 0));

		//retrieve the user id
		var selectQuery = "SELECT id FROM profiles ORDER BY ROWID DESC LIMIT 1";
		return _sqlite.resultToArray(_db.query(selectQuery, true))[0].id;
	},

	/**
	 * Update an existing profile
	 * @param {Number} profileId The id of the profile
	 * @param {String} name (Optional) The name of the profile
	 * @param {String} avatar (Optional) The avatar for the profile
	 * @param {String} theme (Optional) The preferred theme for the profile
	 * @param {String} bluetoothDeviceId (Optional) The preferred Bluetooth device for the profile
	 */
	updateProfile: function(profileId, name, avatar, theme, bluetoothDeviceId) {
		var query = "UPDATE profiles SET {0} WHERE id = {1}";
		var params = [];

		if (typeof name =='string' && name.length > 0) {
			params.push("full_name='{0}'".format(name));
		}
		if (typeof avatar =='string' && avatar.length > 0) {
			params.push("avatar='{0}'".format(avatar));
		}
		if (typeof theme =='string' && theme.length > 0) {
			params.push("theme='{0}'".format(theme));
		}
		if (typeof bluetoothDeviceId =='string' && bluetoothDeviceId.length > 0) {
			params.push("device_id='{0}'".format(bluetoothDeviceId));
		}

		if (params.length > 0) {
			_db.query(query.format(params.join(','), profileId));
		}
	},

	/**
	 * Delete an existing profile
	 * @param {String} profileId The id of the profile
	 */
	deleteProfile: function(profileId) {
		var query_profile = "DELETE FROM profiles WHERE id = {0}".format(profileId);
		var query_settings = "DELETE FROM settings WHERE profile_id = {0}";

		_db.query(query_settings);
		_db.query(query_profile);
	},

	/**
	 * Returns all settings for a given profile
	 * @param {Number} profileId The ID of the profile to get the settings for [optional; default to current user]
	 * @param {Array} settings (Optional) A list of settings to whitelist
	 * @returns {Array} The specified settings for the given profile
	 */
	getSettings: function(profileId, settings) {
		var query = "SELECT * FROM settings WHERE profile_id = {0}".format(profileId);

		if (settings) {
			query += " AND key IN ('{0}')".format(settings.join("','"));
		}

		return _sqlite.resultToArray(_db.query(query));
	},

	/**
	 * Set the value of a setting for a given profile
	 * @param {Number} profileId The id of the profile
	 * @param {String} key The key of the setting
	 * @param {Mixed} value The value of the setting
	 */
	setSetting: function(profileId, key, value) {
		//build the query
		var query = "REPLACE INTO settings (profile_id, key, value) VALUES ({0}, '{1}', '{2}')".format(profileId, _sqlite.sqlSafe(key), _sqlite.sqlSafe(String(value)));

		//execute the query
		_db.query(query);
	},

	/**
	 * Get the navigation history for a given user
	 * @param {Number} profileId The id of the profile
	 * @returns {Array} An array of navigation locations
	 */
	getNavigationHistory: function(profileId) {
		var result = _db.query("SELECT * FROM nav_history WHERE profile_id={0} ORDER BY timestamp DESC".format(profileId));
		return _sqlite.resultToArray(result);
	},
	
	/**
	 * Clears the navigation history for a given user
	 * @param {Number} profileId The id of the profile
	 */
	clearNavigationHistory: function(profileId) {
		_db.query("DELETE FROM nav_history WHERE profile_id={0}".format(profileId));
	},
	
	/**
	 * Adds a location to the navigation history for a given user
	 * @param {Number} profileId The id of the profile
	 * @param {Object} location The location to add to the user's history 
	 */
	addToNavigationHistory: function(profileId, location) {
		var timestamp = Math.floor(new Date().getTime() / 1000);		
		var query = "SELECT id FROM nav_history WHERE profile_id={0} AND name='{1}' AND ((number='{2}' AND street='{3}' AND city='{4}' AND province='{5}' AND country='{6}') OR (latitude={7} AND longitude={8}))".format(profileId, _sqlite.sqlSafe(location.name), _sqlite.sqlSafe(location.number), _sqlite.sqlSafe(location.street), _sqlite.sqlSafe(location.city), _sqlite.sqlSafe(location.province), _sqlite.sqlSafe(location.country), location.latitude, location.longitude);

		//see if this destination is already in the history
		var result = _sqlite.resultToArray(_db.query(query));
		if (result && result.length > 0) {
			//destination exists in history; update the timestamp
			_db.query("UPDATE nav_history SET timestamp={0} WHERE id={1}".format(timestamp, result[0].id));
		} else {
			//destination does not exist in history, add it
			_db.query("INSERT INTO nav_history (profile_id, name, number, street, city, province, postalCode, country, type, latitude, longitude, timestamp) VALUES ({0}, '{1}', '{2}', '{3}', '{4}', '{5}', '{6}', '{7}', '{8}', {9}, {10}, {11})".format(profileId, _sqlite.sqlSafe(location.name), _sqlite.sqlSafe(location.number), _sqlite.sqlSafe(location.street), _sqlite.sqlSafe(location.city), _sqlite.sqlSafe(location.province), _sqlite.sqlSafe(location.postalCode), _sqlite.sqlSafe(location.country), location.type, location.latitude, location.longitude, timestamp));
		}

		
		/* TEST DATA
		INSERT INTO nav_history (profile_id, name, number, street, city, province, postalCode, country, type, timestamp, latitude, longitude) 
		VALUES (1, 'Bridgehead Coffee', '126', 'Guiges Ave', 'Ottawa', 'ON', '', 'Canada', '', 1341949840000, 10.1234, 10.1234);
		INSERT INTO nav_history (profile_id, name, number, street, city, province, postalCode, country, type, timestamp, latitude, longitude) 
		VALUES (1, 'QNX Software Systems', '1001', 'Farrar Rd', 'Kanata', 'ON', 'K2K 1Y5', 'Canada', '', 1341839740000, 10.1234, 10.1234);
		INSERT INTO nav_history (profile_id, name, number, street, city, province, postalCode, country, type, timestamp, latitude, longitude) 
		VALUES (1, 'National Gallery of Canada', '380', 'Sussex Drive', 'Ottawa', 'ON', '', 'Canada', '', 1341839740000, 10.1234, 10.1234);
		INSERT INTO nav_history (profile_id, name, number, street, city, province, postalCode, country, type, timestamp, latitude, longitude) 
		VALUES (1, 'ADDRESS', '404', 'Laurier Ave E', 'Ottawa', 'ON', 'K1N 6R2', 'Canada', '', 1341815840000, 10.1234, 10.1234);
		INSERT INTO nav_history (profile_id, name, number, street, city, province, postalCode, country, type, timestamp, latitude, longitude) 
		VALUES (1, 'Chez Lucien Restaurant', '137', 'Murray Street', 'Ottawa', 'ON', 'K1N 5M7', 'Canada', '', 1341802840000, 10.1234, 10.1234);
		*/
	},
	
	/**
	 * Get the navigation favourites for a given user
	 * @param {Number} profileId The id of the profile
	 * @returns {Array} An array of navigation locations
	 */
	getNavigationFavourites: function(profileId) {	
		var result = _db.query("SELECT * FROM nav_favourites WHERE profile_id={0}".format(profileId));		
		return _sqlite.resultToArray(result);

		/* TEST DATA
		INSERT INTO nav_favourites (profile_id, name, number, street, city, province, postalCode, country, type, latitude, longitude) 
		VALUES (1, 'Bridgehead Coffee', '126', 'Guiges Ave', 'Ottawa', 'ON', '', 'Canada', '', 10.1234, 10.1234);
		INSERT INTO nav_favourites (profile_id, name, number, street, city, province, postalCode, country, type, latitude, longitude) 
		VALUES (1, 'QNX Software Systems', '1001', 'Farrar Rd', 'Kanata', 'ON', 'K2K 1Y5', 'Canada', '', 10.1234, 10.1234);
		INSERT INTO nav_favourites (profile_id, name, number, street, city, province, postalCode, country, type, latitude, longitude) 
		VALUES (1, 'National Gallery of Canada', '380', 'Sussex Drive', 'Ottawa', 'ON', '', 'Canada', '', 10.1234, 10.1234);
		INSERT INTO nav_favourites (profile_id, name, number, street, city, province, postalCode, country, type, latitude, longitude) 
		VALUES (1, 'ADDRESS', '404', 'Laurier Ave E', 'Ottawa', 'ON', 'K1N 6R2', 'Canada', '', 10.1234, 10.1234);
		INSERT INTO nav_favourites (profile_id, name, number, street, city, province, postalCode, country, type, latitude, longitude) 
		VALUES (1, 'Chez Lucien Restaurant', '137', 'Murray Street', 'Ottawa', 'ON', 'K1N 5M7', 'Canada', '', 10.1234, 10.1234);
		*/
	},
	
	/**
	 * Adds a navigation location to the user's favourites
	 * @param {Number} profileId The id of the profile
	 * @param {Object} location The location to add to the user's favourites 
	 */
	addNavigationFavourite: function(profileId, location) {
		var timestamp = Math.floor(new Date().getTime() / 1000);		
		var query = "SELECT id FROM nav_favourites WHERE profile_id={0} AND name='{1}' AND ((number='{2}' AND street='{3}' AND city='{4}' AND province='{5}' AND country='{6}') OR (latitude={7} AND longitude={8}))".format(profileId, _sqlite.sqlSafe(location.name), _sqlite.sqlSafe(location.number), _sqlite.sqlSafe(location.street), _sqlite.sqlSafe(location.city), _sqlite.sqlSafe(location.province), _sqlite.sqlSafe(location.country), location.latitude, location.longitude);

		//see if this destination is already in the favourites
		var result = _sqlite.resultToArray(_db.query(query));
		if (result && result.length == 0) {
			//destination does not exist in favourites, add it
			_db.query("INSERT INTO nav_favourites (profile_id, name, number, street, city, province, postalCode, country, type, latitude, longitude) VALUES ({0}, '{1}', '{2}', '{3}', '{4}', '{5}', '{6}', '{7}', '{8}', {9}, {10})".format(profileId, _sqlite.sqlSafe(location.name), _sqlite.sqlSafe(location.number), _sqlite.sqlSafe(location.street), _sqlite.sqlSafe(location.city), _sqlite.sqlSafe(location.province), _sqlite.sqlSafe(location.postalCode), _sqlite.sqlSafe(location.country), location.type, location.latitude, location.longitude));
		}
	},
	
	/**
	 * Removes a navigation location to the user's favourites
	 * @param {Number} favouriteId The id of the favourite location to remove from the user's favourites 
	 */
	removeNavigationFavourite: function(favouriteId) {
		_db.query("DELETE FROM nav_favourites WHERE id={0}".format(favouriteId));
	},
};