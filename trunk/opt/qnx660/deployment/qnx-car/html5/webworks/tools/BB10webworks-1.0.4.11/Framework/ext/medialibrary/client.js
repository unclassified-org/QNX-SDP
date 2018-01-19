/**
 * @module qnx_xyz_medialibrary
 * @description Allow access to media libraries for media sources
 *
 * @deprecated Please use car.mediaplayer instead.
 */

/* @author mlapierre
 * $Id: client.js 4326 2012-09-27 17:43:24Z mlapierre@qnx.com $
 */

var _ID = require("./manifest.json").namespace;

/*
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Return all songs in the current track session
	 * @param {Object} source A media source as returned by qnx.mediasource.get()
	 * @return {Array} All songs in the current track session
	 */
	getTrackSession: function(source) {
		return window.webworks.execSync(_ID, 'getTrackSession', { source: source });
	},

	/**
	 * Return a single song
	 * @param {Object} source A media source as returned by qnx.mediasource.get()
	 * @param  {Number} fid The fid of the song
	 * @return {Object} A single song matching the provided fid for the specified media source, or null
	 */
	getSong: function(source, fid) {
		return window.webworks.execSync(_ID, 'getSong', { source: source, fid: fid });
	},
	
	/**
	 * Return all songs 
	 * @param {Object} source A media source as returned by qnx.mediasource.get()
	 * @return {Array} All songs for the specified media source
	 */
	getAllSongs: function(source) {
		return window.webworks.execSync(_ID, 'getAllSongs', { source: source });
	},
	
	/**
	 * Return all artists 
	 * @param {Object} source A media source as returned by qnx.mediasource.get()
	 * @return {Array} All artists for the specified media source
	 */
	getArtists: function(source) {
		return window.webworks.execSync(_ID, 'getArtists', { source: source });
	},

	/**
	 * Return all albums for an artist 
	 * @param {Object} source A media source as returned by qnx.mediasource.get()
	 * @param {Number} artistId The ID of the artist
	 * @return {Array} All albums for the specified artist for the specified media source
	 */
	getArtistAlbums: function(source, artistId) {
		return window.webworks.execSync(_ID, 'getArtistAlbums', { source: source, artistId: artistId });
	},
	
	/**
	 * Return all songs for an artist 
	 * @param {Object} source A media source as returned by qnx.mediasource.get()
	 * @param {Number} artistId The ID of the artist
	 * @return {Array} All songs for the specified artist for the specified media source
	 */
	getArtistSongs: function(source, artistId) {
		return window.webworks.execSync(_ID, 'getArtistSongs', { source: source, artistId: artistId });
	},

	/**
	 * Return all songs for an artist on an album
	 * @param {Object} source A media source as returned by qnx.mediasource.get()
	 * @param {Number} artistId The ID of the artist
	 * @param {Number} albumId The ID of the album
	 * @return {Array} All songs for the specified artist/album for the specified media source
	 */
	getArtistAlbumSongs: function(source, artistId, albumId) {
		return window.webworks.execSync(_ID, 'getArtistAlbumSongs', { source: source, artistId: artistId, albumId: albumId });
	},
	
	/**
	 * Return all songs for an album 
	 * @param {Object} source A media source as returned by qnx.mediasource.get()
	 * @param {Number} albumId The ID of the album
	 * @return {Array} All songs for the specified album for the specified media source
	 */
	getAlbumSongs: function(source, albumId) {
		return window.webworks.execSync(_ID, 'getAlbumSongs', { source: source, albumId: albumId });
	},
	
	/**
	 * Return all albums 
	 * @param {Object} source A media source as returned by qnx.mediasource.get()
	 * @return {Array} All albums for the specified media source
	 */
	getAlbums: function(source) {
		return window.webworks.execSync(_ID, 'getAlbums', { source: source });
	},

	/**
	 * Return all genres 
	 * @param {Object} source A media source as returned by qnx.mediasource.get()
	 * @return {Array} All genres for the specified media source
	 */
	getGenres: function(source) {
		return window.webworks.execSync(_ID, 'getGenres', { source: source });
	},

	/**
	 * Return all songs for a genre 
	 * @param {Object} source A media source as returned by qnx.mediasource.get()
	 * @param {Number} genreId The ID of the genre
	 * @return {Array} All songs for the specified genre for the specified media source
	 */
	getGenreSongs: function(source, genreId)
	{
		return window.webworks.execSync(_ID, 'getGenreSongs', { source: source, genreId: genreId });
	},

	/**
	 *Return all videos 
	 * @param {Object} source A media source as returned by qnx.mediasource.get()
	 * @return {Array} All videos for the specified media source
	 */
	getVideos: function(source) {
		return window.webworks.execSync(_ID, 'getVideos', { source: source });
	},
	
	/**
	 * Search the database for matching artists, albums and songs 
	 * @param {Object} source A media source as returned by qnx.mediasource.get()
	 * @param {String} searchterm The term to search for
	 * @return {Array} All search results for the specified search term for the specified media source
	 */
	search: function(source, searchterm) {
		return window.webworks.execSync(_ID, 'search', { source: source, searchterm: searchterm });
	},
	
	/**
	 * @param {Object} source A media source as returned by qnx.mediasource.get()
	 * @param {Number} fid The file ID
	 * @return {Array} The file path for the specified fid for the specified media source
	 */
	getFilePath: function(source, fid) {
		return window.webworks.execSync(_ID, 'getFilePath', { source: source, fid: fid });
	},
};

blackberry.event.addEventListener('mediasourceremoved', function(event) {
	window.webworks.execAsync(_ID, 'close', event);
});
