/**
 * Contains the Search views
 * @author mlapierre
 *
 * $Id: Search.js 5983 2013-04-02 15:37:49Z lgreenway@qnx.com $
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