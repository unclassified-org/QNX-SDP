/**
 * Displays the messages panel. 
 * @author lgreenway
 *
 * $Id: Messages.js 5781 2013-02-05 14:36:48Z lgreenway@qnx.com $
 */
Ext.define('Home.view.Messages', {
	extend: 'Ext.Panel',
	xtype: 'messagesWidget',

	config: {
		layout: 'vbox', 
		scroll: false,
		cls: 'home-messages',

		items: [
			{
				html: 'RECENT MESSAGES',
				cls: 'box-title',
			},{
				xtype: 'dataview',
				cls: 'msglist',
				scrollable: false,
				disableSelection: true,
				store: 'AllMessages',
				emptyText: 'There are no messages.',
				deferEmptyText: false,
				itemTpl: Ext.create('Ext.XTemplate',
						'<div class="message {[this.getMenuImageClass(values.type)]}">',
						'	<div class="msglist-sender">{[this.getSenderName(values)]}</div>',
						'	<div class="msglist-timestamp">{[values.datetime ? Ext.Date.format(values.datetime, (this.checkDateIsToday(values.datetime) ? "g:ia" : "m/d/y")) : ""]}</div>',
						'</div>',
						{
							compiled: true,

							/**
							 * Returns the sender's formatted name based on the values of the Message object.
							 * @param values {Communication.model.Message} The Message model object.
							 * @returns {String} The sender's formatted name.
							 */
							getSenderName: function(values) {
								var name = '';

								if(values.senderFirstName || values.senderLastName) {
									name = (values.senderFirstName + ' ' || '') + (values.senderLastName || '');
								} else if(values.type === qnx.message.MESSAGE_TYPE_EMAIL && values.senderEmail) {
									name = values.senderEmail;
								} else if((values.type === qnx.message.MESSAGE_TYPE_SMS_GSM
										|| values.type === qnx.message.MESSAGE_TYPE_SMS_CDMA
										|| values.type === qnx.message.MESSAGE_TYPE_MMS)
										&& values.senderNumber) {
									name = values.senderNumber;
								}
								
								if(name.trim() == '') {
									name = 'Unknown';
								}
								
								return name;
							},

							/**
							 * Gets the menu image CSS class based on the messageType value.
							 * @param messageType {String} The qnx.message message type.
							 * @returns {String} The CSS class for this message type.
							 */
							getMenuImageClass: function(messageType) {
								var imageType = '';
								switch(messageType) {
								case qnx.message.MESSAGE_TYPE_EMAIL:
									imageType = 'message-email';
									break;
								case qnx.message.MESSAGE_TYPE_SMS_GSM:
								case qnx.message.MESSAGE_TYPE_SMS_CDMA:
								case qnx.message.MESSAGE_TYPE_MMS:
									imageType = 'message-text';
									break;
								}
								return imageType;
							},
							
							checkDateIsToday: function(date) {
								var isToday = false;
								var today = new Date();
								if(date instanceof Date &&
										date.getDate() == today.getDate() &&
										date.getMonth() == today.getMonth() &&
										date.getYear() == today.getYear()) {
									isToday = true;
								}
								return isToday;
							}
						}
				)
			}
		]
	},

});