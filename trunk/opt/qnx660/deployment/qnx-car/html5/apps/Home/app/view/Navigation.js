/**
 * Displays the navigation panel 
 * @author mlapierre
 *
 * $Id: Navigation.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Home.view.Navigation', {
	extend: 'Ext.Panel',
	xtype: 'navigationWidget',
	
	requires: [
		'Ext.Img',
	],

	config: {
		layout: 'vbox', 
		scroll: false,
		cls: 'home-nav',
		
		items: [
			{
				action: 'nav-title',
				html: 'Navigation is not in progress.',
				cls: 'box-title nav-title',
			},{
				action: 'nav-cards',
				layout: 'card',
				cls: 'nav-cardlayout',
				items: [
					{
						action: 'nav-disabled',
						cls: 'nav-disabled',
					},{
						action: 'nav-enabled',
						layout: 'hbox',
						items: [
							{
								xtype: 'image',
								action: 'nav-image',
								cls: 'nav-image',
								src: '',
							},{
								action: 'nav-distance',
								cls: 'nav-distance',
								html: '',
							}
						]
					}
				]
			}
		]
	},
});