/**
 * Search for a city
 * @author mlapierre
 *
 * $Id: City.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Navigation.view.search.Poi', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'searchPoi',
	
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
								placeHolder: '< Enter the name of a place >'
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
				 		itemTpl: Ext.create('Ext.XTemplate', 
				 			'<div class="menu-label">',
								'<div class="menu-line-1">{name}</div>',
								'<div class="menu-line-2">{number} {street} {city} {province} {postalCode}</div>',
							'</div>',
							{
								compiled: true,
							}
						),
		                store: 'PoiResults',
		                emptyText: 'No points of interest matching your query'
					}
				]
			}
		]
	},
});