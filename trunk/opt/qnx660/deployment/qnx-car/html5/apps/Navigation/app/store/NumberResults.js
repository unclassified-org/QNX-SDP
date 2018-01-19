/**
 * A store used to show number search results
 * @author mlapierre
 *
 * $Id: NumberResults.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Navigation.store.NumberResults', {
	extend: 'Ext.data.Store',

	requires: [
		'Navigation.model.Location',
	],

	config: {
		model: 'Navigation.model.Location'
	}
});