/**
 * The address book menu
 * @author mlapierre
 *
 * $Id: AddressBook.js 6848 2013-07-16 21:53:46Z mlytvynyuk@qnx.com $
 */
Ext.define('Communication.view.menu.AddressBook', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuAddressBookView',

	requires: [
		'QnxCar.view.list.List',
	],
	
	initialize: function() {
		this.callParent();
		
		// This is a workaround to allow the listpaging pluging to attach handlers
		// to the store so that the loading mask is displayed when loading new pages.
		this.child('menuList').setStore(Ext.getStore('AddressBook'));
	},

	config: {
		items: [
		    {
				xtype: 'menuList',

				cls: 'menu-list menu-list-addressbook',
				flex: 1,
				indexBar: {
					docked: 'left',
					centered: false,
				},
				grouped: true,
				emptyText: 'There are no contacts.',
		 		itemTpl: Ext.create('Ext.XTemplate', 
							'<div class="menu-label menu-image-right menu-image-contact" style="{[this.getContactPictureStyle(values.picture)]}">',
                                '<tpl>{[values.displayLabel]}',
								'</tpl>',
							'</div>',
							{
								compiled: true,
								/**
								* Returns a style attribute with a background-image style
								* pointing to the contact's photo.
								* @returns {String} The 
								*/
								getContactPictureStyle: function(picture) {
									var style = '';
									if(picture) {
										style = 'background-image: url(file://' + picture + ');';
									}
									return style;
								}
							}
						)
			}
		]
	}
});