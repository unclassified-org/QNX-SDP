/**
 *
 * @author lgreenway
 * $Id: TrackSessionEvent.js 6896 2013-07-24 14:12:41Z mthomas@qnx.com $
 *
 */

module.exports = {};
/**
 * @static
 * @memberOf module:car_xyz_mediaplayer
 * @name TrackSessionEvent
 *
 * @description  Tracksession event enumeration
 *
 * @property CREATED The tracksession is created.
 * @property DESTROYED The tracksession is destroyed.
 * @property APPENDED The tracksession is appended. 
 */  
Object.defineProperties(module.exports,
{
	'CREATED':		{ value: 0, enumerable: true, writable: false },
	'DESTROYED':	{ value: 1, enumerable: true, writable: false },
	'APPENDED':		{ value: 2, enumerable: true, writable: false }
});