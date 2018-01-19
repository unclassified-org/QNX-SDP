/**
 * Contains the search - select source view
 * @author mlapierre
 *
 * $Id: Source.js 5759 2013-01-29 18:52:49Z lgreenway@qnx.com $
 */
Ext.define('Communication.view.search.AsrSearch', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'searchAsrSearchView',
	
	requires: [
		'QnxCar.view.list.List',
	],

	config: {
		level: 0,
		items: [
			{
				cls: 'search panel',
				type: 'vbox',
				items: [
					{
						xtype: 'container',
						cls: 'search-title',
						html: 'SEARCH RESULTS:',
					},{
						xtype: 'menuList',
						cls: 'menu-list search-source-list',
						emptyText: 'No search results.',
				 		itemTpl: Ext.create('Ext.XTemplate', 
									'<div class="menu-label menu-image-right menu-image-contact" style="{[this.getContactPictureStyle(values.picture)]}">',
										'<tpl if="firstName || lastName">',
											'{[values.firstName != "" ? values.firstName : ""]}{[values.lastName != "" ? " " + values.lastName : ""]}',
										'<tpl else>',
											'<tpl if="email1">',
												'{email1}',
											'<tpl else>',
												'Unnamed',
											'</tpl>',
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
								),
						store: 'SearchContacts',
					}
				]
			}
		]
	},
});