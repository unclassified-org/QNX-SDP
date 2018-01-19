/**
 * Search for an Address
 * @author dkerr
 *
 * $Id:$
 */
Ext.define('Navigation.view.search.Address', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'searchAddress',
	
	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		items: [
			{
				cls: 'search panel',
				layout: 'vbox',
				items: [
					{
						xtype: 'container',
						cls: 'search-title',
						id: 'address-search-title',
					},{
		                xtype: 'menuList',
						cls: 'menu-list search-results',
				 		itemTpl: Ext.create('Ext.XTemplate', 
				 			'<div class="menu-label">',
								'<div class="menu-line-1">{number} {street}</div>',
								'<div class="menu-line-2">{city} {province} {postalCode}</div>',
							'</div>',
							{
								compiled: true,
							}
						),
		                store: 'AddressResults',
		                emptyText: 'There are no addresses matching your query',
					}
				]
			}
		]
	},
});