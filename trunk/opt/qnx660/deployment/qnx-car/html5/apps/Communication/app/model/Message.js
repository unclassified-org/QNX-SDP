/**
 * Represents a single message
 * @author mlapierre
 *
 * $Id: Message.js 5114 2012-11-19 23:36:40Z lgreenway@qnx.com $
 */
Ext.define('Communication.model.Message', {
   extend: 'Ext.data.Model',
   
   requires: ['Communication.model.Contact'],

   config: {
	   	idProperty: 'handle',
		fields: [
				{name: "accountId",			type: "number"},
				{name: "accountName",		type: "number"},
				{name: "type",				type: "string"},
				{name: "handle",			type: "string"},
				{name: "folderName",		type: "string"},
				{name: "folderPath",		type: "string"},
				{name: "datetime",			type: "date",	dateFormat: 'c'},
				{name: "senderFirstName",	type: "string"},
				{name: "senderLastName",	type: "string"},
				{name: "senderEmail",		type: "string"},
				{name: "senderNumber",		type: "string"},
				{name: "replyToFirstName",	type: "string"},
				{name: "replyToLastName",	type: "string"},
				{name: "replyToEmail",		type: "string"},
				{name: "replyToNumber",		type: "string"},
				{name: "subject",			type: "string"},
				{name: "bodyPlainText",		type: "string"},
				{name: "bodyHtml",			type: "string"},
				{name: "read",				type: "boolean"},
				{name: "priority",			type: "boolean"},
				{name: "protected",			type: "boolean"},
				{name: "sent",				type: "boolean"},
			],
			hasMany: [
				{ model: 'Communication.model.Contact', name: 'toRecipients', associationKey: 'toRecipients' },
				{ model: 'Communication.model.Contact', name: 'ccRecipients', associationKey: 'ccRecipients' },
				{ model: 'Communication.model.Contact', name: 'bccRecipients', associationKey: 'bccRecipients' },
			],
   },
});
