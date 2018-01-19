/**
 * A store used to show city results
 * @author mlapierre
 *
 * $Id: CityResults.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Navigation.store.CityResults', {
	extend: 'Ext.data.Store',

	requires: [
		'Navigation.model.Location',
	],

	config: {
		model: 'Navigation.model.Location'
	}
});