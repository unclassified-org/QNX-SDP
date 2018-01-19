/**
 * Provides generic navigation accessor methods for event triggers
 *
 * @author mlapierre
 * $Id: navigation.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
var	_provider = null;

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Sets the navigation provider
	 * @param provider {Object} The navigation provider
	 */
	setProvider: function(provider) {
		_provider = provider;
	},

	/**
	 * Sets the trigger function to call when a navigation update event is fired
	 * @param {Function} trigger The trigger function to call when the event is fired
	 */
	setTriggerUpdate: function(trigger) {
		if (_provider && _provider.setTriggerUpdate) {
			_provider.setTriggerUpdate(trigger);			
		}
	},
};
