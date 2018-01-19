/**
 * The main menu
 * @author mlapierre
 *
 * $Id: Menu.js 6804 2013-07-10 14:59:55Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.Menu', {
	extend: 'QnxCar.view.menu.PullDownMenu',
	xtype: 'menuView',

	requires: [
		'QnxCar.view.menu.StackedMenu',
		'MediaPlayer.view.menu.MediaSources',
		'MediaPlayer.view.menu.RadioSources',
		'MediaPlayer.view.menu.PandoraStations',
		'MediaPlayer.view.menu.MediaNode'
	],

	config: {
		items: [
			{
				xtype: 'stackedMenu',
				items: [
						{
							xtype: 'menuMediaSources'
						}
				]
			}
		]
	}
});