/**
 * Represents a single message.
 * @author lgreenway
 *
 * $Id: Message.js 4467 2012-09-30 00:43:20Z lgreenway@qnx.com $
 */
Ext.define('Home.model.Message', {
   extend: 'Ext.data.Model',
   
   requires: ['Home.model.Contact'],

   config: {
	   	idProperty: 'handle',
		fields: [
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
				{name: "body",				type: "string"},
				{name: "read",				type: "boolean"},
				{name: "priority",			type: "boolean"},
				{name: "protected",			type: "boolean"},
				{name: "sent",				type: "boolean"},
			],
			hasMany: [
				{ model: 'Home.model.Contact', name: 'toRecipients', associationKey: 'toRecipients' },
				{ model: 'Home.model.Contact', name: 'ccRecipients', associationKey: 'ccRecipients' },
				{ model: 'Home.model.Contact', name: 'bccRecipients', associationKey: 'bccRecipients' },
			],
   },
});
