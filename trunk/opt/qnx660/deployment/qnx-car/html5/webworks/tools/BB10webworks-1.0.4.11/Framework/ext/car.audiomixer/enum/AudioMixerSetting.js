/**
 *
 * @author mlapierre
 * $Id: Event.js 5936 2013-03-25 16:15:21Z lgreenway@qnx.com $
 */

module.exports = {},

Object.defineProperties(module.exports,
{
/**
 * @static
 * @memberOf module:car_xyz_audiomixer
 * @name AudioMixerSetting
 *
 * @description <p>Audio mixer settings enumeration
 * <p>All values indicate a level within a range from 0 to 100%.
 *
 * @property {Number} VOLUME The volume setting. 
 * @property {String} BASS The bass setting.
 * @property {String} MID The midrange setting. 
 * @property {String} TREBLE The treble setting. 
 * @property {Number} BALANCE The balance setting. 
 * @property {String} FADE The fade setting. 
 */

	'VOLUME':		{ value: 'volume',		enumerable: true, writable: false },
	'BASS':			{ value: 'bass',		enumerable: true, writable: false },
	'MID':			{ value: 'mid',			enumerable: true, writable: false },
	'TREBLE':		{ value: 'treble',		enumerable: true, writable: false },
	'BALANCE':		{ value: 'balance',		enumerable: true, writable: false },
	'FADE':			{ value: 'fade',		enumerable: true, writable: false },
});
