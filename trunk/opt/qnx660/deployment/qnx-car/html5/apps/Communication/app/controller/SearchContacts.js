Ext.define('Communication.controller.SearchContacts', {
	extend: 'Ext.app.Controller',

	config: {
		refs: {
			searchContacts: 'searchContactsView',
			contactDetailsMenu:	{ selector: 'menuContactDetailsView',	xtype: 'menuContactDetailsView',autoCreate: true },
			contactDetailsContainer: 'menuContactDetailsView > container[action="details"]',
			searchContactsMenuList: 'searchContactsView menuList',
		},
		control: {
			searchContactsMenuList: {
				itemtap:'onSearchContactsMenuItemTap'
			},
			contactDetailsMenu: {
				dial: 'onContactDetailsDial'
			}

		}
	},

	/**
	 * Initializes the controller on app startup
	 */
	init: function() {
		this.getApplication().on({
			search_index: this.onSearchContacts,
			scope: this
		});
	},

	/**
	 * Shows the search results
	 */
	onSearchContacts: function() {
		Ext.getStore('SearchContacts').load();

		// Hide the main menu
		this.getApplication().fireEvent('menu_hide');

		// Hide all sub-menus immediately
		this.getSearchContacts().hideAllSubMenus(false);

		Ext.Viewport.setActiveItem(this.getSearchContacts());
	},

	/**
	 * Event handler triggered when an item is tapped on the Search Contacts results
	 * @param dv The dataview containing the item
	 * @param index The index of the tapped item
	 * @param item The item that was tapped
	 * @param e The triggered event
	 */
	onSearchContactsMenuItemTap:function (dv, index, item, e) {
		var contact = dv.getStore().getAt(index);

		// Push the contact details menu onto the stack first, so we can be guaranteed that it exists
		this.getSearchContacts().push(this.getContactDetailsMenu());
		this.getContactDetailsContainer().setData(contact.data);
	},


});