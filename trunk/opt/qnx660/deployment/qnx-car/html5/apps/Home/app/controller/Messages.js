/**
 * The controller responsible for managing the message list.
 * @author lgreenway
 *
 * $Id: Messages.js 7083 2013-09-05 17:50:48Z mlapierre@qnx.com $
 */
Ext.define('Home.controller.Messages', {
	extend: 'Ext.app.Controller',

	/**
	 * Convenience reference to the AllMessages store.
	 */
	allMessagesStore: null,
	
	/**
	 * Minimum number of messages to keep in the store. If the store falls below this number
	 * after a removerecords event, then the store will reload the first page of records.
	 */
	MIN_MESSAGES: 4,
	
	/**
	 * Method called when app is ready to launch.
	 */
	launch: function() {
		// Reference to the message stores for convenience
		this.allMessagesStore = Ext.getStore('AllMessages');
		
		// Add an event listener to re-fetch the first page of the store if the number of records
		// falls below the configured minimum.
		this.allMessagesStore.on('removerecords', this.onMessagesRemoved, this);
		
		if (window.cordova) {
			// Message service state change
			document.addEventListener('messageservicestatechange', this.onMessageServiceStateChanged.bind(this));
			
			// Message notifications
			document.addEventListener('messageservicenotification', this.onMessageServiceNotification.bind(this));
		} else {
			// Message service state change
			blackberry.event.addEventListener('messageservicestatechange', this.onMessageServiceStateChanged.bind(this));
			
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
			this.setMessagesAvailable(true);
		} else {
			this.setMessagesAvailable(false);
		}
	},

	/**
	 * @private
	 * messageservicenotification event handler. Executes the related action on application stores depending on
	 * new, updated, deleted, or moved messages.
	 * @param notification {Object} The qnx.message.Message notification object.
	 */
	onMessageServiceNotification: function(notification) {
		// TODO: Implement all types of message notifications
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
					}
					break;
				case qnx.message.NOTIFICATION_MESSAGE_SHIFT:
					console.warn('Home.controller.Messages::onMessageServiceNotification NOTIFICATION_MESSAGE_SHIFT is not supported.');
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
			store.add(Ext.create('Home.model.Message', message));
			
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
	 * Called when the AllMessages store fires a removerecords event. Checks if the number of items
	 * in the store falls below the configured minimum specified by the MIN_MESSAGES constant. If so,
	 * the store will reload the first page of records.
	 * @param store The store object.
	 * @param records The Model instances that was removed.
	 * @param indicies The indices of the records that were removed.
	 * @param eOpts The options object passed to Ext.util.Observable.addListener.
	 */
	onMessagesRemoved: function(store, records, indicies, eOpts) {
		if(store.getCount() < this.MIN_MESSAGES) {
			store.loadPage(1);
		}
	},
	
	/**
	 * Sets message-related actions in application menus as available or unavailable.
	 * @param available {Boolean} Enables menu items if true, disables if false.
	 */
	setMessagesAvailable: function(available) {
		if(available) {
			this.allMessagesStore.loadPage(1);
		} else {
			this.allMessagesStore.removeAll();
		}
	},
});
