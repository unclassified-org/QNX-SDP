/**
 * A store used to show the e-mail messages
 * @author mlapierre
 *
 * $Id: EmailMessages.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Communication.store.EmailMessages', {
	extend  : 'Ext.data.Store',
	requires: ['Communication.model.Message', 'Communication.proxy.Message'],

	config: {
	  model   : 'Communication.model.Message',
	  proxy: {
		  type: 'qnx.message',
		  filterExpression: new qnx.message.FilterExpression(
							  new qnx.message.FilterExpression(qnx.message.FIELD_MESSAGE_TYPE, '=', qnx.message.MESSAGE_TYPE_EMAIL),
							  'AND',
							  new qnx.message.FilterExpression(qnx.message.FIELD_FOLDER_PATH, '=', qnx.message.FOLDER_INBOX)),
	  },
	},
});