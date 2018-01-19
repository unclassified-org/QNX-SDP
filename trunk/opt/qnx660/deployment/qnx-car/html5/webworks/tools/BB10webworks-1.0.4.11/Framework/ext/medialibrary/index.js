/**
* Allows access to media libraries
 *
 * @author mlapierre
 * $Id: index.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _wwfix = require("../../lib/wwfix"),
	_sqlite = require("../../lib/sqlite"),
	_libraries = {},
	
	// The limit of records to return for ALL queries
	// TODO: The limit/offset should be able to be specified on request to support pagination
	RECORD_LIMIT = " LIMIT 250",
	
	SELECT_ARTISTS_TPL = "SELECT DISTINCT " +
			"ar.artist_id as id, " +
			"coalesce(nullif(trim(ar.artist),''), 'Unknown Artist') as artist, " +
			"aw.artwork_url as artwork " +
			"FROM artists ar " +
			"INNER JOIN audio_metadata m ON ar.artist_id = m.artist_id " +
			"LEFT JOIN artworks aw ON m.album_id = aw.album_id AND aw.type = {0} ",
	
	SELECT_ARTISTS = SELECT_ARTISTS_TPL.format('2') +
			"ORDER BY UPPER(artist)" +
			RECORD_LIMIT,
	
	SELECT_ALBUMS_TPL = "SELECT DISTINCT " +
			"al.album_id as id, " +
			"coalesce(nullif(trim(al.album),''), 'Unknown Album') as album, " +
			"aw.artwork_url as artwork " +
			"FROM albums al " +
			"INNER JOIN audio_metadata m ON al.album_id = m.album_id " +
			"LEFT JOIN artworks aw ON m.album_id = aw.album_id AND aw.type = {0} ",
	
	SELECT_ALBUMS = SELECT_ALBUMS_TPL.format('2') +
			"ORDER BY UPPER(album)" +
			RECORD_LIMIT,
	
	SELECT_GENRES_TPL = "SELECT DISTINCT " +
			"gr.genre_id as id, " +
			"coalesce(nullif(trim(gr.genre),''), 'Unknown Genre') genre, " +
			"aw.artwork_url as artwork " +
			"FROM genres gr " +
			"INNER JOIN audio_metadata m ON gr.genre_id = m.genre_id " +
			"LEFT JOIN artworks aw ON m.album_id = aw.album_id AND aw.type = {0} ",
			
	SELECT_GENRES = SELECT_GENRES_TPL.format('2') +
			"ORDER BY UPPER(genre)" +
			RECORD_LIMIT,

	SELECT_SONGS_TPL = "SELECT " +
			"coalesce(nullif(trim(m.title),''), f.filename) as title, " +
			"m.duration as duration, " +
			"f.fid as fid, " +
			"coalesce(nullif(trim(al.album),''), 'Unknown Album') as album, " +
			"coalesce(nullif(trim(ar.artist),''), 'Unknown Artist') as artist, " +
			"aw.artwork_url as artwork "+
			"FROM files f " +
			"INNER JOIN audio_metadata m ON f.fid = m.fid " +
			"LEFT JOIN albums al ON m.album_id = al.album_id " +
			"LEFT JOIN artists ar ON m.artist_id = ar.artist_id " +
			"LEFT JOIN artworks aw ON m.album_id = aw.album_id AND aw.type = {0} ",
			
	SELECT_SONGS = SELECT_SONGS_TPL.format('2') +
			"ORDER BY UPPER(title)" +
			RECORD_LIMIT,

	SELECT_TRACKSESSION_SONGS = SELECT_SONGS_TPL.format('1') +
			"INNER JOIN player_mpaudio p ON f.fid = p.fid " +
			"ORDER BY p.trkid" +
			RECORD_LIMIT,

	SELECT_SONG = SELECT_SONGS_TPL.format('1') +
			"WHERE f.fid = {0}",
			
	SELECT_ARTIST_ALBUMS = SELECT_ALBUMS_TPL.format('2') +
			"WHERE m.artist_id = {0} " +
			"ORDER BY UPPER(album)" +
			RECORD_LIMIT,	
	
	SELECT_ARTIST_SONGS = SELECT_SONGS_TPL.format('2') +
			"WHERE m.artist_id = {0} " +
			"ORDER BY UPPER(title)" +
			RECORD_LIMIT,

	SELECT_ARTIST_ALBUM_SONGS = SELECT_SONGS_TPL.format('2') +
			"WHERE m.artist_id = {0} " +
			"AND m.album_id = {1} " +
			"ORDER BY m.disc, m.track" +
			RECORD_LIMIT,

	SELECT_ALBUM_SONGS = SELECT_SONGS_TPL.format('2') +
			"WHERE m.album_id = {0} " +
			"ORDER BY m.disc, m.track" +
			RECORD_LIMIT,

	SELECT_GENRE_SONGS = SELECT_SONGS_TPL.format('2') +
			"WHERE m.genre_id = {0} " +
			"ORDER BY upper(title)" +
			RECORD_LIMIT,

	SELECT_VIDEOS = "SELECT " +
			"f.fid as fid, " +
			"m.duration as duration, " +
			"coalesce(nullif(trim(m.title),''), f.filename) as title " +
			"FROM files f " +
			"INNER JOIN video_metadata m ON f.fid = m.fid " +
			"ORDER BY UPPER(title)" +
			RECORD_LIMIT,

	SEARCH = 
			"SELECT " + 
			"ar.artist_id as dbId, " +
			"ar.artist as name, " + 
			"'artist' as type " +
			"FROM artists ar " + 
			"WHERE UPPER(ar.artist) LIKE UPPER('%{0}%') " +
			
			"UNION " +
			
			"SELECT " +
			"al.album_id as dbId, " +
			"al.album as name,  " +
			"'album' as type " +
			"FROM albums al " +
			"WHERE UPPER(al.album) LIKE UPPER('%{0}%') " +
			
			"UNION " +
			
			"SELECT " +
			"m.fid as dbId, " + 
			"m.title as name, " + 
			"'song' as type " +
			"FROM audio_metadata m " +
			"WHERE UPPER(m.title) LIKE UPPER('%{0}%') " +
			
			"ORDER BY name" +
			RECORD_LIMIT,

	GET_FILE_PATH = "SELECT basepath, filename FROM files LEFT JOIN folders ON files.folderid = folders.folderid WHERE fid={0}";


/**
 * Returns the media library for the given source
 * @param source {Object} A media source as returned by qnx.mediasource.get()
 * @returns {Object} The sql connection to the media library for the given source, or null
 * @throws {Error} If the source is invalid or if unable to open a sqlite connection
 */
function getLibrary(source) {
	if (source && source.id) {
		if (!_libraries[source.id]) {
			var library = _sqlite.createObject();
			if (!library || !library.open(source.db)) {
				throw "qnx.medialibrary::getLibrary [index.js] Error opening db; path=" + source.db;
			}
			_libraries[source.id] = library;
		}
		return _libraries[source.id];
	} else {
		throw "qnx.medialibrary::getLibrary [index.js] Invalid source";
	}
}

/**
 * Returns an array for a query result
 * @param {Object} result The result of a query
 * @returns {Array} n array for a query result
 */
function resultToArray(result) {
	if (result == null || result.length <= 0)
	{
		return [];
	}
	
	var colNames = result.getColNames();
	var out = [];
	while ((row = result.getRow()) != null)
	{
		var o = {};
		for (var i=0; i<colNames.length; i++)
		{
			o[colNames[i]] = row[i];
		}
		out.push(o);
	}
	
	return out;
}

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	
	/**
	 * Returns all songs in the current tracksession
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		source: {Object}, //as returned by qnx.mediasource.get()
	 *	}
	 * @param env {Object} Environment variables
	 */
	getTrackSession: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(resultToArray(getLibrary(args.source).query(SELECT_TRACKSESSION_SONGS)));
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Returns a single song
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		source: {Object}, //as returned by qnx.mediasource.get()
	 *		fid: {Number}, //the fid of the song
	 *	}
	 * @param env {Object} Environment variables
	 */
	getSong: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			var out = resultToArray(getLibrary(args.source).query(SELECT_SONG.format(args.fid)));
			if (out && out.length > 0) {
				success(out[0]);				
			} else {
				throw "qnx.medialibrary::getSong [index.js] No result for fid=" + args.fid;
			}
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Returns all songs 
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		source: {Object}, //as returned by qnx.mediasource.get()
	 *	}
	 * @param env {Object} Environment variables
	 */
	getAllSongs: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(resultToArray(getLibrary(args.source).query(SELECT_SONGS)));
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Returns all artists 
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		source: {Object}, //as returned by qnx.mediasource.get()
	 *	}
	 * @param env {Object} Environment variables
	 */
	getArtists: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(resultToArray(getLibrary(args.source).query(SELECT_ARTISTS)));
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Returns all albums for an artist 
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		source: {Object}, //as returned by qnx.mediasource.get()
	 *		artistId: {Object}, //the id of the artist
	 *	}
	 * @param env {Object} Environment variables
	 */
	getArtistAlbums: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(resultToArray(getLibrary(args.source).query(SELECT_ARTIST_ALBUMS.format(args.artistId))));
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Returns all songs for an artist 
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		source: {Object}, //as returned by qnx.mediasource.get()
	 *		artistId: {Object}, //the id of the artist
	 *	}
	 * @param env {Object} Environment variables
	 */
	getArtistSongs: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(resultToArray(getLibrary(args.source).query(SELECT_ARTIST_SONGS.format(args.artistId))));
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Returns all songs for an artist on an album
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		source: {Object}, //as returned by qnx.mediasource.get()
	 *		artistId: {Object}, //the id of the artist
	 *		albumId: {Object}, //the id of the album
	 *	}
	 * @param env {Object} Environment variables
	 */
	getArtistAlbumSongs: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(resultToArray(getLibrary(args.source).query(SELECT_ARTIST_ALBUM_SONGS.format(args.artistId, args.albumId))));
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Returns all songs for an album 
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		source: {Object}, //as returned by qnx.mediasource.get()
	 *		albumId: {Object}, //the id of the album
	 *	}
	 * @param env {Object} Environment variables
	 */
	getAlbumSongs: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(resultToArray(getLibrary(args.source).query(SELECT_ALBUM_SONGS.format(args.albumId))));
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Returns all albums 
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		source: {Object}, //as returned by qnx.mediasource.get()
	 *	}
	 * @param env {Object} Environment variables
	 */
	getAlbums: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(resultToArray(getLibrary(args.source).query(SELECT_ALBUMS)));
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Returns all genres 
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		source: {Object}, //as returned by qnx.mediasource.get()
	 *	}
	 * @param env {Object} Environment variables
	 */
	getGenres: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(resultToArray(getLibrary(args.source).query(SELECT_GENRES)));
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Returns all songs for a genre 
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		source: {Object}, //as returned by qnx.mediasource.get()
	 *		genreId: {Object}, //the id of the genre
	 *	}
	 * @param env {Object} Environment variables
	 */
	getGenreSongs: function(success, fail, args, env)
	{
		try {
			args = _wwfix.parseArgs(args);
			success(resultToArray(getLibrary(args.source).query(SELECT_GENRE_SONGS.format(args.genreId))));
		} catch (e) {
			fail(-1, e);
		}
	},

	/**
	 * Returns all videos 
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		source: {Object}, //as returned by qnx.mediasource.get()
	 *	}
	 * @param env {Object} Environment variables
	 */
	getVideos: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(resultToArray(getLibrary(args.source).query(SELECT_VIDEOS)));
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Search the database for matching artists, albums and songs 
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		source: {Object}, //as returned by qnx.mediasource.get()
	 *		searchterm: {Object}, //the term to search for
	 *	}
	 * @param env {Object} Environment variables
	 */
	search: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			success(resultToArray(getLibrary(args.source).query(SEARCH.format(_sqlite.sqlSafe(args.searchterm)))));
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Returns a file path for a file id 
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		source: {Object}, //as returned by qnx.mediasource.get()
	 *		fid: {Number}, //the fid of the song
	 *	}
	 * @param env {Object} Environment variables
	 */
	getFilePath: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			var result = getLibrary(args.source).query(GET_FILE_PATH.format(args.fid));
			if (result != null)
			{
				var row = result.getRow();
				if (row != null && row[0] != null && row[1] != null)
				{
					success(row[0] + row[1]);
					return;
				}
			}
			throw "qnx.medialibrary::getFilePath [index.js] Unable to determine file path";
		} catch (e) {
			fail(-1, e);
		}
	},
	
	/**
	 * Close the connection to a database 
	 * @param success {Function} Function to call if the operation is a success
	 * @param fail {Function} Function to call if the operation fails
	 * @param args {Object} The arguments supplied. Available arguments for this call are:
	 *	{
	 *		id: {Number}, //the id of the media source
	 *	}
	 * @param env {Object} Environment variables
	 */
	close: function(success, fail, args, env) {
		try {
			args = _wwfix.parseArgs(args);
			if (_libraries[args.id]) {
				_libraries[args.id].close();
				delete _libraries[args.id];
			}
			success();
		} catch (e) {
			fail(-1, e);
		}
	},
};

