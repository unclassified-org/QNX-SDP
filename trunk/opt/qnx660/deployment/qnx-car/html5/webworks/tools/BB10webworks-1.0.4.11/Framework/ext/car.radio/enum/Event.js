/**
 * @private
 * 
 * @name car.radio.Event
 * @static
 *
 * Event enumeration.
 *
 * @author mlapierre
 * $Id: Event.js 5936 2013-03-25 16:15:21Z lgreenway@qnx.com $
 */

module.exports = {};

/**  @property UPDATE Represents a status update event */
/**  @property PRESETS Represents a preset update event */
Object.defineProperties(module.exports,
{
	'UPDATE':		{ value: 'car.radio.event.update',	enumerable: true, writable: false },
	'PRESETS':		{ value: 'car.radio.event.presets',	enumerable: true, writable: false },
});