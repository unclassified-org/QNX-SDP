/**
 * Displays the social card
 * @author dkerr
 *
 * $Id: SocialCard.js 5166 2012-11-22 19:27:47Z mlytvynyuk@qnx.com $
 */
Ext.define('AppSection.view.SocialCard', {
	extend: 'AppSection.view.BaseCard',
	xtype: 'social_card',

	config: {
		title: 'SOCIAL',
		cls: 'card card5',
		id: 'socialCard',
		store: 'Social'
	}
});

