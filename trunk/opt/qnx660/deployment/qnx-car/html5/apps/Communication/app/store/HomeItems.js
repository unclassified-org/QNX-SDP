/**
 * A genre store used to show genres in the menus
 * @author mlapierre
 *
 * $Id: HomeItems.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Communication.store.HomeItems', {
	extend  : 'Ext.data.Store',
	requires: ['Communication.model.HomeItem'],
	
	config: {
	  model   : 'Communication.model.HomeItem',
		data: [
			{ label: 'EMAIL MESSAGES', 	cls: 'home-email',			available: false,	safe: false,	event: 'email_index'},
			{ label: 'TEXT MESSAGES',	cls: 'home-text',			available: false,	safe: false,	event: 'text_index'},
			{ label: 'ADDRESS BOOK',	cls: 'home-addressbook',	available: false,	safe: false,	event: 'addressbook_index'},
			{ label: 'DIAL PAD',		cls: 'home-dialpad',		available: false,	safe: false,	event: 'dialpad_index'}
		]
	}
});