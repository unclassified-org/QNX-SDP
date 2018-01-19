/**
 * A store used to show all messages
 * @author mlapierre
 *
 * $Id: AllMessages.js 4470 2012-09-30 01:29:50Z lgreenway@qnx.com $
 */
Ext.define('Communication.store.AllMessages', {
	extend  : 'Ext.data.Store',
	requires: ['Communication.model.Message', 'Communication.proxy.Message'],

	config: {
		model   : 'Communication.model.Message',
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