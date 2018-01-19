/**
 * @author lgreenway
 * $Id: MediaNodeType.js 6865 2013-07-22 13:55:20Z mthomas@qnx.com $
 */

module.exports = {};
/**
 * @memberOf module:car_xyz_mediaplayer
 * @name MediaNodeType
 *
 * @description  Media node type enumeration
 *
 *  @property UNKNOWN The media type is unknown.
 *  @property FOLDER The media type is folder.
 *  @property AUDIO The media type is audio.
 *  @property VIDEO The media type is video. 
 *  @property PHOTO The media type is photo. 
 */  
Object.defineProperties(module.exports,
{
	'UNKNOWN':		{ value: 0, enumerable: true, writable: false },
	'FOLDER':		{ value: 1, enumerable: true, writable: false },
	'AUDIO':		{ value: 2, enumerable: true, writable: false },
	'VIDEO':		{ value: 3, enumerable: true, writable: false },
	'PHOTO':		{ value: 5, enumerable: true, writable: false }
});