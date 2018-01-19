/**
 * The poi sub-categories menu
 * @author mlapierre
 *
 * $Id: SubCategories.js 5856 2013-02-28 19:58:52Z lgreenway@qnx.com $
 */
Ext.define('Navigation.view.menu.poi.SubCategories', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuPoiSubCategories',

	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		items: [
			{
				xtype: 'menuList',
		 		itemTpl: '<div class="menu-label menu-image-right menu-image-{type}">{name}</div>',
				store: 'PoiSubCategories',
				emptyText: 'There are no Points of Interest matching your selection',
			}
		]
	},
});