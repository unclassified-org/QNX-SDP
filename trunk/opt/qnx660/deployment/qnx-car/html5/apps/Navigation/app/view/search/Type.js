/**
 * Choose your search type - by address or by name
 * @author mlapierre
 *
 * $Id: City.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Navigation.view.search.Type', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'searchType',
	
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
						cls: 'search-title',
						html: 'I WOULD LIKE TO FIND...',
					},{
						xtype: 'menuList',
						cls: 'menu-list search-type',
						itemTpl: '<div class="menu-label">{name}</div>',
						store: {
							data: [
								{ name: 'an Address', value: 'address' },
								{ name: 'a Point of Interest', value: 'poi' }
							]
						}
					}
				]
			}
		]
	},
});