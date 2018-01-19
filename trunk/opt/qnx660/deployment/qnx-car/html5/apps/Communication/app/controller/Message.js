/**
 * The controller responsible for managing the availability of the Address Book and
 * processing refresh requests.
 * @author lgreenway
 *
 * $Id: Message.js 7261 2013-09-26 14:53:11Z mlapierre@qnx.com $
 */
Ext.define('Communication.controller.Message', {
	extend: 'Ext.app.Controller',

	/**
	 * Convenience reference to the AllMessages store.
	 */
	allMessagesStore: null,
	
	/**
	 * Convenience reference to the EmailMessages store.
	 */
	emailMessagesStore: null,

	/**
	 * Convenience reference to the TextMessages store.
	 */
	textMessagesStore: null,
	
	/**
	 * Method called when app is ready to launch.
	 */
	launch: function() {
		// Application event handlers
		this.getApplication().on({
			get_full_message: this.getFullMessage,
			scope: this
		});
		
		// Reference to the message stores for convenience
		this.allMessagesStore = Ext.getStore('AllMessages');
		this.emailMessagesStore = Ext.getStore('EmailMessages');
		this.textMessagesStore = Ext.getStore('TextMessages');
		
		if (window.cordova) {
			// Message service state change
			document.addEventListener('messageservicestatechange', this.onMessageServiceStateChanged.bind(this));
			
			// Get full message events
			document.addEventListener('messageservicemessageresult', this.onMessageServiceMessageResult.bind(this));
			document.addEventListener('messageservicemessagefail', this.onMessageServiceMessageFail.bind(this));

			// Message notifications
			document.addEventListener('messageservicenotification', this.onMessageServiceNotification.bind(this));

		} else {
			// Message service state change
			blackberry.event.addEventListener('messageservicestatechange', this.onMessageServiceStateChanged.bind(this));
			
			// Get full message events
			blackberry.event.addEventListener('messageservicemessageresult', this.onMessageServiceMessageResult.bind(this));
			blackberry.event.addEventListener('messageservicemessagefail', this.onMessageServiceMessageFail.bind(this));

			// Message notifications
			blackberry.event.addEventListener('messageservicenotification', this.onMessageServiceNotification.bind(this));
		}
			
		// Check the message state immediately
		this.onMessageServiceStateChanged(qnx.message.getState());
	},
	
	/**
	 * @private
	 * messageservicestatechange event handler. Responsible for enabling or disabling message-related actions
	 * from application menus.
	 * @param state {String} The qnx.message.Message service state.
	 */
	onMessageServiceStateChanged: function(state) {
		if(typeof(state) === 'string' && state === qnx.message.STATE_CONNECTED) {
			this.setMessagesAvailable(qnx.message.getAccounts());
		} else {
			this.setMessagesAvailable([]);
		}
	},

	/**
	 * @private
	 * messageservicemessageresult event handler. Updates the message in the application stores.
	 * @param message {Object} An object literal with properties matching those of qnx.message.Message.
	 */
	onMessageServiceMessageResult: function(message) {
		if(message) {
			// Update all messages store
			this.updateStoreMessage(this.allMessagesStore, message);

			if(message.type == qnx.message.MESSAGE_TYPE_EMAIL) {
				// Update email messages store
				this.updateStoreMessage(this.emailMessagesStore, message);
			} else if(message.type == qnx.message.MESSAGE_TYPE_SMS_GSM
						|| message.type == qnx.message.MESSAGE_TYPE_SMS_CDMA) {
				// Update text messages store
				this.updateStoreMessage(this.textMessagesStore, message);
			}
		} else {
			// TODO: i18n
			Ext.Msg.alert('Error', 'There was an error loading this message, please try again.');
			console.error('Communication.controller.Message::onMessageServiceMessageResult invalid message argument: ' + message);
		}
		
		// Remove the loading mask
		Ext.Viewport.setMasked(false);
	},
	
	/**
	 * messageservicemessagefail event handler. Hides the loading mask and shows an error message.
	 * @param err {String} The error message from the qnx.message extension.
	 */
	onMessageServiceMessageFail: function(err) {
		// Remove the loading mask
		Ext.Viewport.setMasked(false);

		// Show the error message
		Ext.Msg.alert('Error', 'There was an error loading this message, please try again. (Error: ' + err + ')');
		console.error('Communication.controller.Message::onMessageServiceMessageFail: ' + err);
	},
	
	/**
	 * @private
	 * messageservicenotification event handler. Executes the related action on application stores depending on
	 * new, updated, deleted, or moved messages.
	 * @param notification {Object} The qnx.message.Message notification object.
	 */
	onMessageServiceNotification: function(notification) {
		// TODO: Implement all types of message notifications
		console.log('Communication.controller.Message::onMessageServiceNotification', notification);

		if(notification && notification.type) {
			switch(notification.type) {
				case qnx.message.NOTIFICATION_NEW_MESSAGE:
					if(notification.message && notification.message.handle && notification.message.type) {
						// Re-fetch the message so that we're dealing with a Message object
						var messageList = qnx.message.find(new qnx.message.FilterExpression(
								new qnx.message.FilterExpression(qnx.message.FIELD_HANDLE, '=', notification.message.handle),
								'AND',
								new qnx.message.FilterExpression(qnx.message.FIELD_MESSAGE_TYPE, '=', notification.message.type)
							)
						);

						if(messageList.length > 0) {
							if(messageList[0].folderPath == qnx.message.FOLDER_INBOX) {
								// Add the message to the all messasges store
								this.addStoreMessage(this.allMessagesStore, messageList[0]);
								
								if(notification.message.type == qnx.message.MESSAGE_TYPE_EMAIL) {
									// Add to the email message store
									this.addStoreMessage(this.emailMessagesStore, messageList[0]);
								} else if(notification.message.type == qnx.message.MESSAGE_TYPE_SMS_GSM
										|| notification.message.type == qnx.message.MESSAGE_TYPE_SMS_CDMA) {
									// Add to the text message store
									this.addStoreMessage(this.textMessagesStore, messageList[0]);
								}
							} else {
								console.log('Ignoring non-inbox message (' +
									'Handle: ' + notification.message.handle + ', ' +
									'Type: ' + notification.message.type + ')');
							}
						} else {
							console.error('Communication.controller.Message::onMessageServiceNotification could not find message (' +
									'Handle: ' + notification.message.handle + ', ' +
									'Type: ' + notification.message.type + ')');
						}
					}
					break;
				case qnx.message.NOTIFICATION_MESSAGE_DELETED:
					if(notification.message && notification.message.handle && notification.message.type) {
						// Remove from the all messages store
						this.deleteStoreMessage(this.allMessagesStore, { handle: notification.message.handle, type: notification.message.type });
						
						if(notification.message.type == qnx.message.MESSAGE_TYPE_EMAIL) {
							// Remove from the email messages store
							this.deleteStoreMessage(this.emailMessagesStore, { handle: notification.message.handle, type: notification.message.type });
						} else if(notification.message.type == qnx.message.MESSAGE_TYPE_SMS_GSM
								|| notification.message.type == qnx.message.MESSAGE_TYPE_SMS_CDMA) {
							// Remove from the text messages store
							this.deleteStoreMessage(this.textMessagesStore, { handle: notification.message.handle, type: notification.message.type });
						}
					}
					break;
				case qnx.message.NOTIFICATION_MESSAGE_SHIFT:
					break;
			}
		} else {
			console.warn('Communication.controller.Message::onMessageServiceNotification invalid message service notification:', notification);
		}
	},
	
	/**
	 * Adds a message to the specified store.
	 * @param store {Ext.data.Store} The message store.
	 * @param message {Object} An object literal with properties matching those of Communication.model.Message.
	 */
	addStoreMessage: function(store, message) {
		if(store && message) {
			// Add the message
			store.add(Ext.create('Communication.model.Message', message));
			
			// Re-sort the store
			store.sort('datetime', 'DESC');
		}
	},
	
	/**
	 * @private
	 * Updates the specified store with a message result, if that message is found in that store.
	 * @param store {Ext.data.Store} The message store.
	 * @param message {Object} An object literal with properties matching those of Communication.model.Message.
	 */
	updateStoreMessage: function(store, message) {
		if(store && message && message.handle && message.type) {
			// Find the message
			var findFn = this.createMessageFindFunction(message.handle, message.type);
			storeMessage = store.getAt(store.findBy(findFn));
			delete findFn;
			
			// If the message is found, update its properties
			if(storeMessage) {
				storeMessage.set(message);
			}
		} else {
			console.error('Communication.controller.message::updateStoreMessage invalid arguments.', store, message);
		}
	},
	
	/**
	 * Deletes a message from the specified store.
	 * @param store {Ext.data.Store} The message store.
	 * @param message {Object} An object literal with properties matching those of Communication.model.Message.
	 */
	deleteStoreMessage: function(store, message) {
		if(store && message && message.handle && message.type) {
			// Remove the message
			var findFn = this.createMessageFindFunction(message.handle, message.type);
			store.removeAt(store.findBy(this.createMessageFindFunction(message.handle, message.type)));
			delete findFn;
			
			// Re-sort the store
			store.sort('datetime', 'DESC');
		} else {
			console.error('Communication.controller.message::deleteStoreMessage invalid arguments.', store, message);
		}
	},
	
	/**
	 * Returns a store findBy function which filters on message type and handle.
	 * @param handle {String} The message handle.
	 * @param type {String} The message type.
	 * @returns {Function} The store findBy filter function.
	 */
	createMessageFindFunction: function(handle, type) {
		return function(record, id) {
			var match = false;
			if(record.get('type') == type && record.get('handle') == handle) {
				match = true;
			}
			return match;
		};
	},
	
	/**
	 * Sets message-related actions in application menus as available or unavailable.
	 * @param accounts {Array} The list of MAP accounts on the connected device.
	 */
	setMessagesAvailable: function(accounts) {
		var emailAvailable = false,
			textAvailable = false;
		
		if(Array.isArray(accounts)) {
			for(var i = 0; i < accounts.length; i++) {
				// Check for accounts which support EMAIL messages
				if(accounts[i].messageTypes.indexOf(qnx.message.MESSAGE_TYPE_EMAIL) >= 0) {
					emailAvailable = true;
				}
				
				// Check for accounts which support SMS messages
				// Note that MMS messages are not currently supported in the HMI, so we don't check on that type
				if(accounts[i].messageTypes.indexOf(qnx.message.MESSAGE_TYPE_SMS_GSM) >= 0
					|| accounts[i].messageTypes.indexOf(qnx.message.MESSAGE_TYPE_SMS_CDMA) >= 0) {
					textAvailable = true;
				}
			}
		}
		
		// Main menu items
		Ext.getStore('MainMenu').findRecord('type', 'messages').set('available', emailAvailable || textAvailable);

		// Messages menu items
		Ext.getStore('MessagesMenu').findRecord('type', 'email').set('available', emailAvailable);
		Ext.getStore('MessagesMenu').findRecord('type', 'text').set('available', textAvailable);
		
		// Home items
		Ext.getStore('HomeItems').findRecord('cls', 'home-email').set('available', emailAvailable);
		Ext.getStore('HomeItems').findRecord('cls', 'home-text').set('available', textAvailable);
		
	},

	/**
	 * @private
	 * Reaches out to the message service extension to get the full contents of the specified message
	 * @param event {Object} An object containing the message type, and message handle.
	 * Ex:
	 * {
	 * 	type: 'EMAIL',
	 * 	handle: '123456'
	 * }
	 */
	getFullMessage: function(event) {
		if(event.accountId, event.handle) {
			// Add a loading mask
			Ext.Viewport.setMasked({ xtype: 'loadmask' });
			qnx.message.getMessage(event.accountId, event.handle);
		} else {
			console.warn('Communication.controller.Message::getFullMessage invalid argument:', event);
		}
	},
	
	refreshMessages: function() {
		// Remove existing items from the store
		// Send the refresh command
	},

});
