/**
 * Contains the search - select source view
 * @author mlapierre
 *
 * $Id: Source.js 7920 2013-12-16 18:09:20Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.view.search.Source', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'searchSourceView',
	
	requires: [
		'QnxCar.view.list.List',
		'MediaPlayer.view.util.Media'
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
						emptyText:'No search sources.',
						deferEmptyText: false,
						itemTpl: '<div class="menu-label menu-image-left ' +
							'{[MediaPlayer.view.util.Media.getMediaSourceMenuImageClassName(values.type)]} menu-source-synched-{ready}">' +
							'{name}' +
							'</div>',
						store: 'SearchSources',
					}
				]
			}
		]
	},
});