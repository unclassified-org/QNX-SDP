/**
 * Contains the search - search view
 * @author mlapierre
 *
 * $Id: Search.js 7271 2013-10-01 19:26:57Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.view.search.Search', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'searchSearchView',
	
	requires: [
		'QnxCar.view.list.List',
		'MediaPlayer.view.util.Media'
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
						itemTpl: '<div class="menu-label menu-image-right {[MediaPlayer.view.util.Media.getNodeTypeMenuImageClassName(values.type, values.metadata)]}" ' +
							'style="{[MediaPlayer.view.util.Media.getNodeArtworkStyle(values.metadata)]}">{name}</div>',
						store: 'SearchResults'
					}
				]
			}
		]
	}
});