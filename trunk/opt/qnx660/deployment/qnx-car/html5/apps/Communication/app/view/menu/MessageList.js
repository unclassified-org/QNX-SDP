/**
 * A message list in the menu
 * @author mlapierre
 *
 * $Id: MessageList.js 6528 2013-06-12 20:11:36Z mlytvynyuk@qnx.com $
 */
Ext.define('Communication.view.menu.MessageList', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuMessageListView',

	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		items: [
			{
				xtype: 'menuList',
			    plugins: [
							{
								xclass: 'Ext.plugin.ListPaging',
								loadMoreText: '',
								autoPaging: true,
								loadTpl: [''],
								loadMoreCmp: {
									xtype: 'component',
									baseCls: Ext.baseCSSPrefix + 'list-paging last-element',
									scrollDock: 'bottom',
									hidden: true
								}
							},
							/*{
					            xclass: 'Ext.plugin.PullRefresh',
					            pullRefreshText: 'Pull down to refresh',
							}*/
					    ],
				emptyText: 'There are no messages.',
		 		itemTpl: Ext.create('Ext.XTemplate', 
							'<div class="menu-label menu-image-right {[this.getMenuImageClass(values.type)]}">',
								'<div class="menu-line-1">',
									'<div class="left">{[this.getSenderName(values)]}</div>',
									'<div class="right">{[values.datetime ? Ext.Date.format(values.datetime, "m/d/Y g:ia") : ""]}</div>',
								'</div>',
								'<div class="menu-line-2">{subject}</div>',
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
											imageType = 'menu-image-email';
											break;
										case qnx.message.MESSAGE_TYPE_SMS_GSM:
										case qnx.message.MESSAGE_TYPE_SMS_CDMA:
										case qnx.message.MESSAGE_TYPE_MMS:
											imageType = 'menu-image-text';
											break;
									}
									return imageType;
								}
							}
						)
			}
		]
	}

});