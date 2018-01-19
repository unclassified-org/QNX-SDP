/**
 *
 * @author lgreenway
 * $Id: MediaSourceType.js 6865 2013-07-22 13:55:20Z mthomas@qnx.com $
 */

module.exports = {};

/**
 * @memberOf module:car_xyz_mediaplayer
 * @name MediaSourceType
 *
 * @description  Media source type enumeration
 *
 * @property HDD The media source is HDD.
 * @property USB The media source is USB.
 * @property IPOD The media source is iPod.
 * @property DLNA The media source is DLNA.
 * @property BLUETOOTH The media source is Bluetooth.
 * @property MTP The media source is MTP. 
 */ 
Object.defineProperties(module.exports,
{
	'HDD':			{ value: 0x00000001, enumerable: true, writable: false },
	'USB':			{ value: 0x00000002, enumerable: true, writable: false },
	'IPOD':			{ value: 0x00000010, enumerable: true, writable: false },
	'DLNA':			{ value: 0x00000100, enumerable: true, writable: false },
	'BLUETOOTH':	{ value: 0x00001000, enumerable: true, writable: false },
	'MTP':			{ value: 0x00010000, enumerable: true, writable: false }
});