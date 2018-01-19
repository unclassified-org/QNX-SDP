/**
 * Displays the home view 
 * @author mlapierre
 *
 * $Id: Home.js 5737 2013-01-28 16:51:35Z lgreenway@qnx.com $
 */
Ext.define('Communication.view.Home', {
	extend: 'Ext.Panel',
	xtype: 'homeView',
	
	requires: [
		'QnxCar.view.menu.ShowButton',
	],

	initialize: function() {
	},

	config: {
		cls: 'comm-panel home-panel',
		items: [
			{
				xtype: 'menuShowButton',
			},{
				xtype: 'dataview',
				listeners: {
					initialize: function() {
						// HACK: This is a workaround to prevent errors in the ST2.1 DataView implementation [TOUCH-3888]
						this.refresh();
					}
				},
				cls: 'home-dv',
				store: 'HomeItems',
				scrollable: false,
		 		itemTpl: Ext.create('Ext.XTemplate', 
							'<div class="{[this.getClass(values)]}">',
								'<span>{label}</span>',
							'</div>',
							{
								compiled: true,
								
								getClass: function(homeItem) {
									var cls = 'home-item ' + homeItem.cls;
									if(!homeItem.safe || !homeItem.available) {
										cls += ' unavailable';
									}
									return cls;
								}
							}
						)
			}
		]
	}
});