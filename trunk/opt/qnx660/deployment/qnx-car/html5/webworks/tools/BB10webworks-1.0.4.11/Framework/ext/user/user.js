/**
 * The abstraction layer for user functionality
 *
 * @author mlapierre
 * $Id: user.js 4287 2012-09-26 13:28:57Z edagenais@lixar.com $
 */

var	_pps = require('../../lib/pps/ppsUtils'),
	_sqlite = require("../../lib/sqlite"),
	_db,
	_readerPPS,
	_writerPPS,
	_trigger;

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
			if (_trigger && event && event.data) {
				_trigger(event.data);
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
	 * Gets the user id from a variable type parameter
	 * @param user {Mixed} The user object or userid of the user 
	 * @returns {Number} The user id of the user
	 */
	getUserId: function(user) {
		var returnVal;

		if (!isNaN(user)) {
			returnVal = user;
		} else if (typeof user == 'object' && !isNaN(user.userId)) {
			returnVal = user.userId;
		} else {
			returnVal = this.getActive().id;
		}

		return returnVal;
	},
	
	/**
	 * Sets the trigger function to call when an event is fired
	 * @param trigger {Function} The trigger function to call when an event is fired
	 */
	setTrigger: function(trigger) {
		_trigger = trigger;
	},
	
	/**
	 * Returns the current user information
	 * @returns {Object} The requested user object
	 * Ex: {
	 *		id: {Number},
	 *		fullName: {String},
	 * 		avatar: {String},
	 * 	}
	 */
	getActive: function() {
		return _readerPPS.ppsObj;
	},
	
	/**
	 * Sets the current user information
	 * @param user {Mixed} The user object or userid of the user 
	 */
	setActive: function(user) {
		if (user && Object.keys(user).length > 0) {
			//write args to pps
			_writerPPS.write(user);
		}
	},
	
	/**
	 * Get the navigation history for a given user
	 * @param user {Mixed} The user object or userid of the user [optional, defaults to current user]
	 * @returns {Array} An array of navigation locations
	 */
	getNavigationHistory: function(user) {
		var userId = this.getUserId(user);
		var result = _db.query("SELECT * FROM nav_history WHERE profile_id={0} ORDER BY timestamp DESC".format(userId));
		return _sqlite.resultToArray(result);
	},
	
	/**
	 * Clears the navigation history for a given user
	 * @param user {Mixed} The user object or userid of the user [optional, defaults to current user]
	 */
	clearNavigationHistory: function(user) {
		var userId = this.getUserId(user);
		
		_db.query("DELETE FROM nav_history WHERE profile_id={0}".format(userId));
	},
	
	/**
	 * Adds a location to the navigation history for a given user
	 * @param location {Object} The location to add to the user's history 
	 * @param user {Mixed} The user object or userid of the user [optional, defaults to current user]
	 */
	addToNavigationHistory: function(location, user) {
		var userId = this.getUserId(user);
		var timestamp = Math.floor(new Date().getTime() / 1000);		
		var query = "SELECT id FROM nav_history WHERE profile_id={0} AND name='{1}' AND ((number='{2}' AND street='{3}' AND city='{4}' AND province='{5}' AND country='{6}') OR (latitude={7} AND longitude={8}))".format(userId, _sqlite.sqlSafe(location.name), _sqlite.sqlSafe(location.number), _sqlite.sqlSafe(location.street), _sqlite.sqlSafe(location.city), _sqlite.sqlSafe(location.province), _sqlite.sqlSafe(location.country), location.latitude, location.longitude);

		//see if this destination is already in the history
		var result = _sqlite.resultToArray(_db.query(query));
		if (result && result.length > 0) {
			//destination exists in history; update the timestamp
			_db.query("UPDATE nav_history SET timestamp={0} WHERE id={1}".format(timestamp, result[0].id));
		} else {
			//destination does not exist in history, add it
			_db.query("INSERT INTO nav_history (profile_id, name, number, street, city, province, postalCode, country, type, latitude, longitude, timestamp) VALUES ({0}, '{1}', '{2}', '{3}', '{4}', '{5}', '{6}', '{7}', '{8}', {9}, {10}, {11})".format(userId, _sqlite.sqlSafe(location.name), _sqlite.sqlSafe(location.number), _sqlite.sqlSafe(location.street), _sqlite.sqlSafe(location.city), _sqlite.sqlSafe(location.province), _sqlite.sqlSafe(location.postalCode), _sqlite.sqlSafe(location.country), location.type, location.latitude, location.longitude, timestamp));
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
	 * @param user {Mixed} The user object or userid of the user [optional, defaults to current user]
	 * @returns {Array} An array of navigation locations
	 */
	getNavigationFavourites: function(user) {
		var userId = this.getUserId(user);
		
		var result = _db.query("SELECT * FROM nav_favourites WHERE profile_id={0}".format(userId));		
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
	 * @param location {Object} The location to add to the user's favourites 
	 * @param user {Mixed} The user object or userid of the user [optional, defaults to current user]
	 */
	addNavigationFavourite: function(location, user) {
		var userId = this.getUserId(user);
		var timestamp = Math.floor(new Date().getTime() / 1000);		
		var query = "SELECT id FROM nav_favourites WHERE profile_id={0} AND name='{1}' AND ((number='{2}' AND street='{3}' AND city='{4}' AND province='{5}' AND country='{6}') OR (latitude={7} AND longitude={8}))".format(userId, _sqlite.sqlSafe(location.name), _sqlite.sqlSafe(location.number), _sqlite.sqlSafe(location.street), _sqlite.sqlSafe(location.city), _sqlite.sqlSafe(location.province), _sqlite.sqlSafe(location.country), location.latitude, location.longitude);

		//see if this destination is already in the favourites
		var result = _sqlite.resultToArray(_db.query(query));
		if (result && result.length == 0) {
			//destination does not exist in favourites, add it
			_db.query("INSERT INTO nav_favourites (profile_id, name, number, street, city, province, postalCode, country, type, latitude, longitude) VALUES ({0}, '{1}', '{2}', '{3}', '{4}', '{5}', '{6}', '{7}', '{8}', {9}, {10})".format(userId, _sqlite.sqlSafe(location.name), _sqlite.sqlSafe(location.number), _sqlite.sqlSafe(location.street), _sqlite.sqlSafe(location.city), _sqlite.sqlSafe(location.province), _sqlite.sqlSafe(location.postalCode), _sqlite.sqlSafe(location.country), location.type, location.latitude, location.longitude));
		}
	},
	
	/**
	 * Removes a navigation location to the user's favourites
	 * @param location {Object} The location to remove from the user's favourites 
	 */
	removeNavigationFavourite: function(location) {
		_db.query("DELETE FROM nav_favourites WHERE id={0}".format(location.id));
	},


	/**
	 * Returns the last ID entered in a given table
	 * 
	 * @param tableName {String} name of the table to get last ID from
	 * @returns {Number} the ID of the last entry of the given table
	 */
	getLastSequenceId: function(tableName) {
		var qry =
			"SELECT id " +
			"FROM {0} " +
			"ORDER BY ROWID DESC " +
			"LIMIT 1";

		return _sqlite.resultToArray(_db.query(qry.format(tableName), true))[0].id;
	},

	/**
	 * Returns all profiles
	 * 
	 * @return {Array} all profiles
	 */
	getAllProfiles: function() {
		var qry = 
			"SELECT " +
				"id, " +
				"full_name, " + 
				"avatar, " + 
				"avatar_file_path, " +
				"theme " +
			"FROM " +
				"profiles";

		return _sqlite.resultToArray(_db.query(qry));
	},

	/**
	 * Returns a single profile
	 * 
	 * @param profileId {Number} The id of the profile
	 * @return {Object} a single profile with all the details
	 * 
	 * 		Example:
	 * 			{
	 * 				full_name {String} name of user
	 * 				theme {String} preferred default theme
	 * 				avatar {Number} preferred avatar
	 * 				device_id {Number} preferred Bluetooth device
	 */
	getProfileDetails: function(profileId) {
		var qry =
			"SELECT " +
				"* " +
			"FROM " +
				"profiles " +
			"WHERE " +
				"id = {0}";

		return _sqlite.resultToArray(_db.query(qry.format(profileId)));
	},


	/**
	 * Create a new profile
	 * 
	 * @param args {Object} object defining the details of a profile
	 * 		Example:
	 * 			{
	 * 				profileId {Number} The id of the profile
	 * 				fullName {String} name of user
	 * 				theme {String} preferred default theme
	 * 				avatar {Number} preferred avatar
	 * 				deviceId {Number} preferred Bluetooth device
	 * 			}
	 * @return {Number} ID of the last row entered in the profiles table
	 */
	addProfile: function(args) {
		var qry =
			"INSERT INTO profiles" +
				"(full_name, theme, avatar, device_id) " +
			"VALUES " +
				"('{0}', '{1}', '{2}', '{3}')";

		_db.query(qry.format(_sqlite.sqlSafe(args.fullName), _sqlite.sqlSafe(args.theme), _sqlite.sqlSafe(args.avatar), args.deviceId));

		return this.getLastSequenceId("profiles");
	},

	/**
	 * Update the value of a key/value pair of a profile
	 * 
	 * @param profileId {Number} ID of the profile
	 * @param attributes {Object} key/value pair(s)
	 * 
	 * 		Example:
	 * 			{
	 * 				full_name {String} full name of the user profile,
	 * 				avatar {String} name of the avatar
	 * 			}
	 */
	updateProfile: function(profileId, attributes) {
		var qry = "";
		var qryChunk1 =
			"UPDATE profiles " +
			"SET ";
		var qryChunk2 = "";
		var qryChunk3 =
			"WHERE " +
				"id = {0}";
		var firstLoop = true;

		try {
			// For each pair provided, create a SQL "SET" 
			for(attributeKey in attributes) {
				// If this is the first iteration of the key/value pairs, set the appropriate flag to true so
				// that any subsequent iterations insert the "," between the "SET" statements
				if(!firstLoop) {
					qryChunk2 += ", ";
				} else {
					firstLoop = false;
				}

				qryChunk2 += attributeKey + " = '" + attributes[attributeKey] + "'";
			}

			// Concatenate all the SQL statement chunks
			qry = qryChunk1 + qryChunk2 + qryChunk3;
	
			return _db.query(qry.format(profileId));
		} catch(err) {
			console.error(err);
		}
	},

	/**
	 * Deletes a profile and all data subsets (cascade)
	 * 
	 * @param profileId {Number} The id of the profile
	 */
	deleteProfile: function(profileId) {
		var qry_profile =
			"DELETE FROM profiles " +
			"WHERE " + 
				"id = {0}";

		/********* BEGIN - HACK TO ACCOMODATE THE LACK OF DRI *********/
		var qry_settings =
			"DELETE FROM settings " +
			"WHERE " + 
				"profile_id = {0}";
		/********* END - HACK TO ACCOMODATE THE LACK OF DRI *********/

		// Perform a cascaded deletion of the profile and all its data subsets
		_db.query(qry_profile.format(profileId));
		_db.query(qry_settings.format(profileId));

		return true;
	},

	/**
	 * Reset the device ids for all profiles that have the unpaired device as their
	 * preferred device
	 * 
	 * @param deviceId {String} MAC of the bluetooth device
	 */
	resetProfilePreferredDevice: function(deviceId) {
		var qry =
			"UPDATE profiles " +
			"SET device_id = 0 " +
			"WHERE device_id = '{0}'";

		_db.query(qry.format(deviceId));
	},

	/**
	 * Returns a setting, if any, according to a set of search criteria
	 * 
	 * @param args {Object} data specifying the name of the key, its value and the profile ID
	 * @returns {Array} db query result - should be one row only. Empty array if no match found.
	 */
	settingExists: function(args) {
		var qry =
			"SELECT " +
				"* " +
			"FROM " +
				"settings " +
			"WHERE " +
				"profile_id = {0} " +
				"AND key = '{1}'";

		return _sqlite.resultToArray(_db.query(qry.format(args.profileId, args.key)));
	},

	/**
	 * Returns all settings for a given profile
	 * @param {Array} settings A list of settings to get [optional]; if omitted, all settings are returned
	 * @param {Number} profileId The ID of the profile to get the settings for [optional; default to current user]
	 * @returns {Array} The specified settings for the given profile
	 */
	getSettings: function(settings, profileId) {
		var query = "SELECT * FROM settings WHERE profile_id = {0}".format((!isNaN(profileId)) ? profileId : this.getActive().id);

		var keys = (settings) ? Object.keys(settings) : null;
		if (keys && keys.length > 0) {
			var inString = "";
			for (var i=0; i<keys.length; i++) {
				if (i > 0) {
					inString += ",";
				}
				inString += "'{0}'".format(_sqlite.sqlSafe(settings[i]));
			}

			query += " AND key IN({0})".format(inString);
		}

		var settingsArray = _sqlite.resultToArray(_db.query(query));
		var out = {};
		for (var i=0; i<settingsArray.length; i++) {
			out[settingsArray[i].key] = settingsArray[i].value;
		}
		return out;
	},

	/**
	 * Inserts or updates a setting(s) for a specific profile
	 * @param {Object} settings Data specifying the name of the key, its value, and the profile ID
	 * @param {Number} profileId The ID of the profile to set the settings [optional; defaults to current user]
	 */
	setSettings: function(settings, profileId) {
		//assert the profile id
		if (isNaN(profileId)) {
			profileId = this.getActive().id;
		}

		//verify that there is at least one setting
		var keys = Object.keys(settings || {});
		if (keys.length <= 0) {
			return;
		}

		//build the query
		var query = "REPLACE INTO settings (profile_id, key, value) VALUES ";
		for (var i=0; i<keys.length; i++) {
			if (i > 0) {
				query += ",";
			}
			query += "({0}, '{1}', '{2}')".format(profileId, _sqlite.sqlSafe(keys[i]), _sqlite.sqlSafe(String(settings[keys[i]])));
		}

		console.log('query=' + query);

		//execute the query
		_db.query(query);
	}
};