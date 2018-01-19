/**
 * Displays the media card
 * @author dkerr
 *
 * $Id: MediaCard.js 5166 2012-11-22 19:27:47Z mlytvynyuk@qnx.com $
 */
Ext.define('AppSection.view.MediaCard', {
	extend: 'AppSection.view.BaseCard',
	xtype: 'media_card',

	config: {
		title: 'MEDIA',
		cls: 'card card4',
		id: 'mediaCard',
		store: 'Media'
	}
});

