/**
 * @private
 * Event enumeration.
 */
 
 /*
 * @author lgreenway
 * $Id: Event.js 6865 2013-07-22 13:55:20Z mthomas@qnx.com $
 */

module.exports = {};

Object.defineProperties(module.exports,
{
	'MEDIA_SOURCE_CHANGE':		{ value: 'car.mediaplayer.mediasourcechange',	enumerable: true, writable: false },
	'TRACK_SESSION_CHANGE':		{ value: 'car.mediaplayer.tracksessionchange',	enumerable: true, writable: false },
	'PLAYER_STATE_CHANGE':		{ value: 'car.mediaplayer.playerstatechange',	enumerable: true, writable: false },
	'TRACK_CHANGE':				{ value: 'car.mediaplayer.trackchange',			enumerable: true, writable: false },
	'TRACK_POSITION_CHANGE':	{ value: 'car.mediaplayer.trackpositionchange',	enumerable: true, writable: false },
	'ERROR':					{ value: 'car.mediaplayer.error',				enumerable: true, writable: false }
});