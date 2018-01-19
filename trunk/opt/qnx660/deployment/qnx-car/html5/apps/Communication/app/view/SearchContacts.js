/**
 * Contains the Search views
 * @author mlapierre
 *
 * $Id: Search.js 5883 2013-03-08 20:47:20Z lgreenway@qnx.com $
 */
Ext.define('Communication.view.SearchContacts', {
	extend: 'QnxCar.view.menu.StackedMenu',
	xtype: 'searchContactsView',
	
	requires: [
		'Communication.view.search.AsrSearch',
	],

	config: {
		items: [
			{
				xtype: 'searchAsrSearchView'
			}
		]
	}
});