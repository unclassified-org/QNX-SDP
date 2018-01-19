/**
 * A store used to show all messages
 * @author mlapierre
 *
 * $Id: AllMessages.js 4467 2012-09-30 00:43:20Z lgreenway@qnx.com $
 */
Ext.define('Home.store.AllMessages', {
	extend  : 'Ext.data.Store',
	requires: ['Home.model.Message', 'Home.proxy.Message'],

	config: {
		model   : 'Home.model.Message',
		proxy: {
			type: 'qnx.message',
			filterExpression: new qnx.message.FilterExpression(
					new qnx.message.FilterExpression(
						new qnx.message.FilterExpression(qnx.message.FIELD_MESSAGE_TYPE, '=', qnx.message.MESSAGE_TYPE_EMAIL),
						'AND',
						new qnx.message.FilterExpression(qnx.message.FIELD_FOLDER_PATH, '=', qnx.message.FOLDER_INBOX)),
					'OR',
					new qnx.message.FilterExpression(
						new qnx.message.FilterExpression(qnx.message.FIELD_MESSAGE_TYPE, '=', qnx.message.MESSAGE_TYPE_SMS_GSM),
						'AND',
						new qnx.message.FilterExpression(qnx.message.FIELD_FOLDER_PATH, '=', qnx.message.FOLDER_INBOX))),
		},
	},
});