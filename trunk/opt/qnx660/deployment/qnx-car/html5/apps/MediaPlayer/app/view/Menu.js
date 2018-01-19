/**
 * The main menu
 * @author mlapierre
 *
 * $Id: Menu.js 5856 2013-02-28 19:58:52Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.Menu', {
	extend: 'QnxCar.view.menu.PullDownMenu',
	xtype: 'menuView',

	requires: [
		'QnxCar.view.menu.StackedMenu',
		'MediaPlayer.view.menu.Main',
		'MediaPlayer.view.menu.BrowseBy',
		'MediaPlayer.view.menu.Songs',
		'MediaPlayer.view.menu.Artists',
		'MediaPlayer.view.menu.Albums',
		'MediaPlayer.view.menu.Genres',
		'MediaPlayer.view.menu.Playlists',
		'MediaPlayer.view.menu.Videos',
		'MediaPlayer.view.menu.RadioSources',
		'MediaPlayer.view.menu.PandoraStations',
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