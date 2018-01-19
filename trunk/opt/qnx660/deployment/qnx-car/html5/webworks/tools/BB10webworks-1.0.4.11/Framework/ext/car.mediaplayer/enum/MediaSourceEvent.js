/**
 * @author lgreenway
 * $Id: MediaSourceEvent.js 6865 2013-07-22 13:55:20Z mthomas@qnx.com $
 */

module.exports = {};

/**
 * @memberOf module:car_xyz_mediaplayer
 * @name MediaSourceEvent
 *
 * @description  Media source event enumeration
 *
 * @property ADDED The media source is added.
 * @property REMOVED The media source is removed.
 * @property UPDATED The media source is updated.
 */ 
Object.defineProperties(module.exports,
{
	'ADDED':	{ value: 0,	enumerable: true, writable: false },
	'REMOVED':	{ value: 1,	enumerable: true, writable: false },
	'UPDATED':	{ value: 2,	enumerable: true, writable: false }
});