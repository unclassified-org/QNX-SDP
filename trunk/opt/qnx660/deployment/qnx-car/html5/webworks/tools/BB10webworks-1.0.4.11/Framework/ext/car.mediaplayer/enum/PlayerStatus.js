/**
 * @author lgreenway
 * $Id: PlayerStatus.js 6865 2013-07-22 13:55:20Z mthomas@qnx.com $
 */

module.exports = {};

/**
 * @memberOf module:car_xyz_mediaplayer
 * @name PlayerStatus
 *
 * @description  Media player status enumeration
 *
 * @property DESTROYED The media player instance was destroyed.
 * @property IDLE The media player is idle.
 * @property PLAYING The media player is playing.
 * @property PAUSED The media player is paused.
 * @property STOPPED The media player is stopped.
 */ 
Object.defineProperties(module.exports,
{
	'DESTROYED':{ value: 0,	enumerable: true, writable: false },
	'IDLE':		{ value: 1,	enumerable: true, writable: false },
	'PLAYING':	{ value: 2,	enumerable: true, writable: false },
	'PAUSED':	{ value: 3,	enumerable: true, writable: false },
	'STOPPED':	{ value: 4,	enumerable: true, writable: false }
});