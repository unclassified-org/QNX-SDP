/**
 * Contains the Search views
 * @author mlapierre
 *
 * $Id: Search.js 5883 2013-03-08 20:47:20Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.Search', {
	extend: 'QnxCar.view.menu.StackedMenu',
	xtype: 'searchView',
	
	requires: [
		'MediaPlayer.view.search.Search',
		'MediaPlayer.view.search.Source',
	],

	config: {
		items: [
			{
				xtype: 'searchSourceView'
			}
		]
	}
});