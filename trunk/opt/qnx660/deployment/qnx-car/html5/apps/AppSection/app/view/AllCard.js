/**
 * Displays the all card (Apps landing page)
 * @author dkerr
 *
 * $Id: AllCard.js 5166 2012-11-22 19:27:47Z mlytvynyuk@qnx.com $
 */
Ext.define('AppSection.view.AllCard', {
	extend: 'AppSection.view.BaseCard',
	xtype: 'all_card',

	requires: [
		'Ext.dataview.DataView'
	],

	config: {
		title: 'ALL',
		cls: 'card card1',
		id: 'allCard',
		store: 'All'
	}
});

