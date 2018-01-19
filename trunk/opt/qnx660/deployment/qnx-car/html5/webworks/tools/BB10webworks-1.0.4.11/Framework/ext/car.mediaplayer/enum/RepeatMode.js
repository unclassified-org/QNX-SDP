/**
 * @author lgreenway
 * $Id: RepeatMode.js 6865 2013-07-22 13:55:20Z mthomas@qnx.com $
 */

module.exports = {};

/**
 * @memberOf module:car_xyz_mediaplayer
 * @name RepeatMode
 *
 * @description  Repeat mode enumeration.
 *
 * @property REPEAT_OFF Repeat mode is off.
 * @property REPEAT_ALL Repeat all tracks.
 * @property REPEAT_ONE Repeat one track.
 */
Object.defineProperties(module.exports,
{
	'REPEAT_OFF':		{ value: 0,	enumerable: true, writable: false },
	'REPEAT_ALL':		{ value: 1,	enumerable: true, writable: false },
	'REPEAT_ONE':		{ value: 2,	enumerable: true, writable: false }
});