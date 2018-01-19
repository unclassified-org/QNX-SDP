/**
 * Search for a city
 * @author mlapierre
 *
 * $Id: City.js 7045 2013-08-28 19:21:59Z nschultz@qnx.com $
 */
Ext.define('Navigation.view.search.City', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'searchCity',
	
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
								cls: 'search-input level1',
								name: 'searchterm',
								placeHolder: '< Enter a city >'
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
		                itemTpl: '<div class="menu-label">{city}, {province}, {country}</div>',
		                store: 'CityResults',
		                emptyText: 'No city matching your query'
					}
				]
			}
		]
	},
	
	
});