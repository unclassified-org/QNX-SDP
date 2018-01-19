/**
 * Displays the home view
 * @author mlapierre
 *
 * $Id: Home.js 5737 2013-01-28 16:51:35Z lgreenway@qnx.com $
 */
Ext.define('Navigation.view.Home', {
	extend: 'Ext.Panel',
	xtype: 'home',
	
	requires: [
		'Ext.dataview.DataView',
		'QnxCar.view.menu.ShowButton',
	],

	config: {
		cls: 'home panel',
		items: [
			{
				xtype: 'menuShowButton',
			},{
				xtype: 'dataview',
				cls: 'home-dv',
				store: 'HomeItems',
				scrollable: false,
		 		itemTpl: Ext.create('Ext.XTemplate', 
					'<div class="item {cls}">',
						'<span>{label}</span>',
					'</div>',
					{
						compiled: true,
					}
				),
			}
		]

	},

});