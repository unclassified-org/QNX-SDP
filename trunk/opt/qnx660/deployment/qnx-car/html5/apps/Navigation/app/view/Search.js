/**
 * Contains the search views
 * @author mlapierre
 *
 * $Id: Search.js 6000 2013-04-03 20:46:59Z dkerr@qnx.com $
 */
Ext.define('Navigation.view.Search', {
	extend: 'QnxCar.view.menu.StackedMenu',
	xtype: 'search',

	requires: [
		'Navigation.view.search.Type',
		'Navigation.view.search.Poi',
		'Navigation.view.search.City',
		'Navigation.view.search.Street',
		'Navigation.view.search.Number',
		'Navigation.view.search.Address',
	],

	config: {
		items: [
			{
				xtype: 'searchType',
			}
		]
	},
});