/**
 * Displays the games card
 * @author dkerr
 *
 * $Id: GamesCard.js 5166 2012-11-22 19:27:47Z mlytvynyuk@qnx.com $
 */
Ext.define('AppSection.view.GamesCard', {
	extend: 'AppSection.view.BaseCard',
	xtype: 'games_card',

	config: {
		title: 'GAMES',
		cls: 'card card6',
		id: 'gamesCard',
		store: 'Games'
	}
});