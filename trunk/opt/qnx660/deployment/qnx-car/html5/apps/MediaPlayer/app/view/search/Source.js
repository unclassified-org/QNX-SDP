/**
 * Contains the search - select source view
 * @author mlapierre
 *
 * $Id: Source.js 5759 2013-01-29 18:52:49Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.search.Source', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'searchSourceView',
	
	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		level: 0,
		items: [
			{
				cls: 'search panel',
				type: 'vbox',
				items: [
					{
						xtype: 'container',
						cls: 'search-title',
						html: 'SELECT SEARCH SOURCE:',
					},{
						xtype: 'menuList',
						cls: 'menu-list search-source-list',
						itemTpl: '<div class="menu-label menu-image-left menu-image-{type} menu-source-synched-{synched}">{name}</div>',
						store: 'MediaSources',
					}
				]
			}
		]
	},
});