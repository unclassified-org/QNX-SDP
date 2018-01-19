/**
 * The controller responsible for the media player landing page.
 * @author mlapierre
 *
 * $Id: Menu.js 6138 2013-05-01 13:59:48Z lgreenway@qnx.com $
 */
Ext.define('Communication.controller.Menu', {

	extend:'Ext.app.Controller',

	config:{
		refs:{
			mainMenu:'menuView',
			
			menuStack: 'menuView > stackedMenu',
			
			callLogsMenu:		{ selector: 'menuCallLogsView',			xtype: 'menuCallLogsView',		autoCreate: true },
			messagesMenu:		{ selector: 'menuMessagesView',			xtype: 'menuMessagesView',		autoCreate: true },
			messageListMenu:	{ selector: 'menuMessageListView',		xtype: 'menuMessageListView',	autoCreate: true },
			messageDetailsMenu:	{ selector: 'menuMessageDetailsView',	xtype: 'menuMessageDetailsView',autoCreate: true },
			addressBookMenu:	{ selector: 'menuAddressBookView',		xtype: 'menuAddressBookView',	autoCreate: true },
			contactDetailsMenu:	{ selector: 'menuContactDetailsView',	xtype: 'menuContactDetailsView',autoCreate: true },

			callLogsMenuList:'menuCallLogsView > list',
			messageListMenuList:'menuMessageListView > list',
			messageDetailsContainer:'menuMessageDetailsView > container[action="details"]',
			addressBookMenuList:'menuAddressBookView > list',
			contactDetailsContainer:'menuContactDetailsView > container[action="details"]',
			
			menuShowButton:'menuShowButton',
			
			dialPad:'menuDialPadView'
		},
		control:{
			'menuMain > list':{
				itemtap:'onMainMenuItemTap'
			},
			callLogsMenuList: {
				itemtap: 'onCallLogsMenuItemTap'
			},
			'menuMessagesView > list':{
				itemtap:'onMessagesMenuItemTap'
			},
			messageListMenuList:{
				itemtap:'onMessageListMenuItemTap'
			},
			addressBookMenuList:{
				itemtap:'onAddressBookMenuItemTap'
			},
			contactDetailsMenu: {
				dial: 'onContactDetailsDial'
			}
		},
	},

	/**
	 * Initializes the controller on app startup
	 */
	init:function () {
		this.getApplication().on({
			menu_show:this.onShow,
			menu_hide:this.onHide,
			
			email_index:this.emailInboxShow,
			text_index:this.textMessagesShow,
			addressbook_index:this.addressBookShow,
			calllog_index:this.callLogShow,
			
			contacts_refreshing: this.onContactsRefreshing,
			
			scope:this
		});

		this.addressBookStore = Ext.getStore('AddressBook');
		this.mainMenuStore = Ext.getStore('MainMenu');
		this.messagesMenuStore = Ext.getStore('MessagesMenu');
		this.allMessageStore = Ext.getStore('AllMessages');
		this.emailMessageStore = Ext.getStore('EmailMessages');
		this.textMessageStore = Ext.getStore('TextMessages');
		
		this.mainMenuStore.on('updaterecord', this.onMenuItemDataUpdate, this);
	},

	/**
	 * Method called when app is ready to launch
	 */
	launch:function () {
		// Add menu hide button handlers
		var hideButtons = Ext.ComponentQuery.query("menuHideButton");
		for (var i = 0; i < hideButtons.length; i++) {
			hideButtons[i].element.on({
				touchstart:function () {
					this.getApplication().fireEvent('menu_hide');
				},
				scope:this
			});
		}

		// Add menu show button handlers
		var showButtons = Ext.ComponentQuery.query("menuShowButton");
		for (var i = 0; i < showButtons.length; i++) {
			showButtons[i].element.on({
				touchstart:function () {
					this.getApplication().fireEvent('menu_show');
				},
				scope:this
			});
		}
	},

	/**
	 * Method called when we want to show the menu
	 */
	onShow:function () {
		//show the menu
		this.getMainMenu().show();
	},

	/**
	 * Method called when we want to hide the menu
	 */
	onHide:function () {
		this.getMainMenu().hide();
	},
	
	/**
	 * Hides applicable sub-menus if a main menu item becomes unavailable.
	 * @param store
	 * @param record
	 * @param newIndex
	 * @param oldIndex
	 * @param modifiedFieldNames
	 * @param modifiedValues
	 * @param eOpts
	 */
	onMenuItemDataUpdate: function(store, record, newIndex, oldIndex, modifiedFieldNames, modifiedValues, eOpts) {
		if(modifiedFieldNames.indexOf('available') >= 0 && record.get('available') === false) {
			switch(record.get('type')) {
				case 'recent':
					this.getMenuStack().pop(this.getCallLogsMenu());
					break;
				case 'messages':
					this.getMenuStack().pop(this.getMessagesMenu());
					break;
				case 'addressbook':
					this.getMenuStack().pop(this.getAddressBookMenu());
					break;
			}
		}
	},

	/**
	 * Event handler triggered when an item is tapped on the Main menu
	 * @param dv The dataview containing the item
	 * @param index The index of the tapped item
	 * @param item The item that was tapped
	 * @param e The triggered event
	 */
	onMainMenuItemTap:function (dv, index, target, record) {
		if(record.get('available')) {
			switch (record.get('type')) {
				case 'recent':
					this.getMenuStack().push(this.getCallLogsMenu());
					break;
				
				case 'messages':
					this.getMenuStack().push(this.getMessagesMenu());
					break;
	
				case 'addressbook':
					this.getMenuStack().push(this.getAddressBookMenu());
					break;
	
				case 'dialpad':
					this.getApplication().fireEvent('dialpad_index');
					this.getMainMenu().hide();
					break;
	
				default:
					console.warn('onMainMenuItemTap: unknown menu item type:' + item.get('type'));
					break;
			}
		}
	},

	onCallLogsMenuItemTap: function(dv, index, item, e) {
		// TODO: Show call log details menu
	},
	
	/**
	 * Event handler triggered when an item is tapped on the Messages menu
	 * @param dv The dataview containing the item
	 * @param index The index of the tapped item
	 * @param item The item that was tapped
	 * @param e The triggered event
	 */
	onMessagesMenuItemTap:function (dv, index, item, e) {
		// Push the message list menu onto the stack first, so we can be guaranteed that it exists
		this.getMenuStack().push(this.getMessageListMenu());

		var item = this.messagesMenuStore.getAt(index);
		switch (item.get('type')) {
			case 'allmsgs':
				this.setMessageListMenuListStore(this.allMessageStore);
				break;

			case 'email':
				this.setMessageListMenuListStore(this.emailMessageStore);
				break;

			case 'text':
				this.setMessageListMenuListStore(this.textMessageStore);
				break;

			default:
				console.warn('onMessagesMenuItemTap: unknown menu item type:' + item.get('type'));
				break;
		}
	},

	/**
	 * Event handler triggered when an item is tapped on the Message List menu
	 * @param dv The dataview containing the item
	 * @param index The index of the tapped item
	 * @param item The item that was tapped
	 * @param e The triggered event
	 */
	onMessageListMenuItemTap:function (dv, index, item, e) {
		var message = this.getMessageListMenuList().getStore().getAt(index);

		// Fire an event to get the full contents of the message if the body of the message
		// has not already been loaded.
		if(message.get('bodyPlainText') === null && message.get('bodyHtml') === null) {
			this.getApplication().fireEvent('get_full_message', { accountId: message.get('accountId'), handle: message.get('handle') });
		}
		
		// Push the message details menu onto the stack first, so we can be guaranteed that it exists
		this.getMenuStack().push(this.getMessageDetailsMenu());
		this.getMessageDetailsContainer().setRecord(message);
	},

	/**
	 * Event handler triggered when an item is tapped on the Address Book menu
	 * @param dv The dataview containing the item
	 * @param index The index of the tapped item
	 * @param item The item that was tapped
	 * @param e The triggered event
	 */
	onAddressBookMenuItemTap:function (dv, index, item, e) {
		var contact = this.getAddressBookMenuList().getStore().getAt(index);

		// Push the contact details menu onto the stack first, so we can be guaranteed that it exists
		this.getMenuStack().push(this.getContactDetailsMenu());
		this.getContactDetailsContainer().setData(contact.data);
	},

	/**
	 * Handles dial action events from the contact details view.
	 * @param {Number} number The number attached to the dial event. 
	 */
	onContactDetailsDial: function(number) {
		// We can use the main menu store to get the status of the HFP service based on the availability
		// of the dial pad menu item.
		var dialpadItem = this.mainMenuStore.findRecord('type', 'dialpad');
		if(dialpadItem && dialpadItem.get('available')) {
			this.onHide();
			this.getApplication().fireEvent('dialpad_index', { number: number, autoDial: true });
		}
	},
	
	/**
	 * Displays the email inbox menu.
	 * */
	emailInboxShow: function() {
		// Hide all sub-menus on the stack
		this.getMenuStack().hideAllSubMenus(false);
		
		// Show the menus
		this.getMainMenu().show();
		this.getMenuStack().push([
			this.getMessagesMenu(),
			this.getMessageListMenu()
		]);
		
		this.setMessageListMenuListStore(this.emailMessageStore);
	},

	/**
	 * Displays the text messages menu.
	 * */
	textMessagesShow: function() {
		// Hide all sub-menus on the stack
		this.getMenuStack().hideAllSubMenus(false);
		
		// Show the menus
		this.getMainMenu().show();
		this.getMenuStack().push([
			this.getMessagesMenu(),
			this.getMessageListMenu()
		]);

		this.setMessageListMenuListStore(this.textMessageStore);
	},

	/**
	 * Displays the address book menu.
	 * */
	addressBookShow: function() {
		// Hide all sub-menus on the stack
		this.getMenuStack().hideAllSubMenus(false);

		this.getMainMenu().show();
		this.getMenuStack().push(this.getAddressBookMenu());
	},
	
	/**
	 * Displays the recent call log menu.
	 * */
	callLogShow: function() {
		// Hide all sub-menus on the stack
		this.getMenuStack().hideAllSubMenus(false);
		
		this.getMainMenu().show();
		this.getMenuStack().push(this.getCallLogsMenu());
	},

	/**
	 * Sets the specified store on the message list menu list, removes all records
	 * from the store, and then forces the store to reload the first page of data.
	 * @param store {Ext.data.Store} The store to set on the message list menu list.
	 */
	setMessageListMenuListStore: function(store) {
		store.removeAll();
		this.getMessageListMenuList().setStore(store);
		store.loadPage(1);
	},
	
	onContactsRefreshing: function() {
		// If the contacts detail menu is currently showing, hide it since the data may no longer
		// be relevant/available after the refresh operation.
		this.getMenuStack().pop(this.getContactDetailsMenu());
	},
});