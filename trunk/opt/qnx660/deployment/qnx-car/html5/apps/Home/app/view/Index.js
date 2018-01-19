/**
 * Displays the index view 
 * @author mlapierre
 *
 * $Id: Index.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Home.view.Index', {
	extend: 'Ext.Panel',
	xtype: 'homeView',
	
	requires: [
		'Home.view.Media',
		'Home.view.Messages',
		'Home.view.Navigation',
		'Home.view.Weather',
	],

	config: {
		layout: 'hbox',
		cls: 'home-panel',
		items: [
			{
				//left hand column
				layout: 'vbox',
				cls: 'home-leftcol',
				items: [
					{
						xtype: 'navigationWidget'
					},{
						xtype: 'weatherWidget'
					}
				]
			},{
				//right hand column
				layout: 'vbox',
				cls: 'home-rightcol',
				items: [
					{
						xtype: 'mediaWidget'
					},{
						xtype: 'messagesWidget'
					}
				]
			}
		]
	},

});