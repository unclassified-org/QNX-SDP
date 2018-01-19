/**
 * The settings menu
 * @author mlapierre
 *
 * $Id: Number.js 7045 2013-08-28 19:21:59Z nschultz@qnx.com $
 */
Ext.define('Navigation.view.search.Number', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'searchNumber',

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
								cls: 'search-input level3',
								name: 'searchterm',
								placeHolder: '< Enter a number >'
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
		                itemTpl: '<div class="menu-label">{number} {street}</div>',
		                store: 'NumberResults',
		                emptyText: 'No street number matching your query'
					}
				]
			}
		]
	},
});