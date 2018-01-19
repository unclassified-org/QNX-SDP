/**
 * The poi categories menu
 * @author mlapierre
 *
 * $Id: Categories.js 5856 2013-02-28 19:58:52Z lgreenway@qnx.com $
 */
Ext.define('Navigation.view.menu.poi.Categories', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuPoiCategories',

	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		items: [
			{
				xtype: 'menuList',
		 		itemTpl: '<div class="menu-label menu-image-right menu-image-{type}">{name}</div>',
				store: 'PoiCategories',
				emptyText: 'There are no Points of Interest',
			}
		]
	},
});