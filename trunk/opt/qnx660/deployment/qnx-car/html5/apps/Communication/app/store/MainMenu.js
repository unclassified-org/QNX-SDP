/**
 * A store used to show the items in the main menu
 * @author mlapierre
 *
 * $Id: MainMenu.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Communication.store.MainMenu', {
	extend  : 'Ext.data.Store',
	requires: ['Communication.model.MenuItem'],

	config: {
	  model   : 'Communication.model.MenuItem',
		data: [
			{ label: 'Recent', 			available: false,	type: 'recent'},
			{ label: 'Address Book', 	available: false,	type: 'addressbook'},
			{ label: 'Messages', 		available: false,	type: 'messages'},
			{ label: 'Dial Pad', 		available: false,	type: 'dialpad'},
		]
	},
});