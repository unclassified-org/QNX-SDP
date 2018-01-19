/**
 * Contains the search - search view
 * @author mlapierre
 *
 * $Id: Search.js 5759 2013-01-29 18:52:49Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.search.Search', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'searchSearchView',
	
	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		level: 1,
		items: [
			{
				cls: 'search panel',
				layout: 'vbox',
				items: [
					{
						xtype: 'container',
						cls: 'search-searchbar',
						layout: 'hbox',
						items: [
							{
								xtype: 'textfield',
								cls: 'search-input',
								name: 'searchterm',
								placeHolder: 'Type an artist, album or song name',
							},{
								xtype: 'button',
								cls: 'search-button',
								action: 'search',
								text: 'SEARCH',
							}
						]
					},{
						xtype: 'menuList',
						cls: 'menu-list search-results',
						itemTpl: '<div class="menu-label menu-image-right menu-image-{type}">{name}</div>',
						store: 'SearchResults',
					}
				]
			}
		]
	},
});