/**
 * The main menu
 * @author mlapierre
 *
 * $Id: Menu.js 5856 2013-02-28 19:58:52Z lgreenway@qnx.com $
 */
Ext.define('Navigation.view.Menu', {
	extend: 'QnxCar.view.menu.PullDownMenu',
	xtype: 'menuView',

	requires: [
		'QnxCar.view.menu.StackedMenu',
		'Navigation.view.menu.Main',
		'Navigation.view.menu.Favourites',
		'Navigation.view.menu.History',
		'Navigation.view.menu.Settings',
		'Navigation.view.menu.settings.Route',
		'Navigation.view.menu.settings.Language',
		'Navigation.view.menu.settings.Map',
		'Navigation.view.menu.settings.Units',
		'Navigation.view.menu.settings.Picker',
		'Navigation.view.menu.poi.Categories',
		'Navigation.view.menu.poi.SubCategories',
		'Navigation.view.menu.poi.Locations',
		'Navigation.view.menu.favourites.AddFavourite',
	],

	config: {
		items: [
			{
				xtype: 'stackedMenu',
				items: [
					{
						xtype: 'menuMain'
					}
				]
			}
		]
	}
});