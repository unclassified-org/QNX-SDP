/**
 * A store used to show the items in the messages menu
 * @author mlapierre
 *
 * $Id: MessagesMenu.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Communication.store.MessagesMenu', {
	extend  : 'Ext.data.Store',
	requires: ['Communication.model.MenuItem'],

	config: {
	  model   : 'Communication.model.MenuItem',
		data: [
			{ label: 'All Messages', 		type: 'allmsgs'},
			{ label: 'Email Inbox', 		type: 'email'},
			{ label: 'Text Messages', 		type: 'text'},
		]
	}
});