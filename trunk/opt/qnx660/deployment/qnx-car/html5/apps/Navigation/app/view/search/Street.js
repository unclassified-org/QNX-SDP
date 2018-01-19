/**
 * The settings menu
 * @author mlapierre
 *
 * $Id: Street.js 7045 2013-08-28 19:21:59Z nschultz@qnx.com $
 */
Ext.define('Navigation.view.search.Street', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'searchStreet',

	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		items: [
			{
				cls: 'search panel',
				layout: 'vbox',
				items: [
					{
						xtype: 'container',
						cls: 'search-bar',
						layout: 'hbox',
						items: [
							{
								xtype: 'textfield',
								cls: 'search-input level2',
								name: 'searchterm',
								placeHolder: '< Enter a street >'
							},{
								xtype: 'button',
								cls: 'search-button green',
								action: 'search',
								text: 'SEARCH',
							}
						]
					},{
		                xtype: 'menuList',
						cls: 'menu-list search-results',
		                itemTpl: '<div class="menu-label">{street}</div>',
		                store: 'StreetResults',
		                emptyText: 'No street matching your query'
					}
				]
			}
		]
	},
});