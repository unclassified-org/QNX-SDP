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
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setUpdateTrigger: function(trigger) {
		if (_provider && _provider.setUpdateTrigger) {
			_provider.setUpdateTrigger(trigger);			
		}
	},
	
	/**
	 * Sets the trigger function to call when a navigation started event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setStartedTrigger: function(trigger) {
		if (_provider && _provider.setStartedTrigger) {
			_provider.setStartedTrigger(trigger);
		}
	},
	
	/**
	 * Sets the trigger function to call when a navigation stopped event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setStoppedTrigger: function(trigger) {
		if (_provider && _provider.setStoppedTrigger) {
			_provider.setStoppedTrigger(trigger);
		}
	},

	/**
	 * Sets the trigger function to call when a navigation error event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setErrorTrigger: function(trigger) {
		if (_provider && _provider.setErrorTrigger) {
			_provider.setErrorTrigger(trigger);
		}
	},

	/**
	 * Sets the trigger function to call when a poi browse result set is available
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setPOIResultTrigger: function(trigger) {
		if (_provider && _provider.setPOIResultTrigger) {
			_provider.setPOIResultTrigger(trigger);
		}
	},
	
	/**
	 * Sets the trigger function to call when a poi search result set is available
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setPOISearchResultTrigger: function(trigger) {
		if (_provider && _provider.setPOISearchResultTrigger) {
			_provider.setPOISearchResultTrigger(trigger);
		}
	},

	/**
	 * Sets the trigger function to call when a search result set is available
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setSearchResultTrigger: function(trigger) {
		if (_provider && _provider.setSearchResultTrigger) {
			_provider.setSearchResultTrigger(trigger);
		}
	},
};
