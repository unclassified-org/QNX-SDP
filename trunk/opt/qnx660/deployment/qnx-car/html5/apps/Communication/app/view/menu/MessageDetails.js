/**
 * Details of a message
 * @author mlapierre
 *
 * $Id: MessageDetails.js 5856 2013-02-28 19:58:52Z lgreenway@qnx.com $
 */
Ext.define('Communication.view.menu.MessageDetails', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuMessageDetailsView',

	config: {
		items: [
			{
				action: 'details',
				cls: 'menu-msgdetails',
				scrollable: 'vertical',
		 		tpl: Ext.create('Ext.XTemplate', 
							'<div class="menu-msgdetails-toprow">',
								'<div class="menu-msgdetails-sender">{[this.getSenderName(values)]}</div>',
								'<div class="menu-msgdetails-timestamp">{[values.datetime ? Ext.Date.format(values.datetime, "m/d/Y g:ia") : ""]}</div>',
							'</div>',
							'<tpl if="type==\'' + qnx.message.MESSAGE_TYPE_EMAIL + '\'">',
								'<div class="menu-msgdetails-subject">{[values.subject ? values.subject : ""]}</div>',
							'</tpl>',
							'<tpl if="bodyPlainText">',
								'<div class="menu-msgdetails-message"><pre>{bodyPlainText}<pre></div>',
							'<tpl elseif="bodyHtml">',
								'<div class="menu-msgdetails-message"><pre>{bodyHtml:htmlEncode}<pre></div>',
							'<tpl else>',
								'<div class="menu-msgdetails-message"></div>',
							'</tpl>',
							{
								compiled: true,

								// FIXME: This is a duplicate function definition, also defined in MessageList.js
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
								}
							}
						)
			}
		]
	}

});