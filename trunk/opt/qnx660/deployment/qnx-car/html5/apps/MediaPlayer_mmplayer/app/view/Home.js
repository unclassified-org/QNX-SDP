/**
 * Displays the home view (media landing page)
 * @author mlapierre
 *
 * $Id: Home.js 6632 2013-06-20 15:18:00Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.Home', {
	extend: 'Ext.Panel',
	xtype: 'homeView',

	config: {
		cls: 'media-panel home-panel',
		items: [
			{
				xtype: 'menuShowButton',
			},
			{
				xtype: 'dataview',
				store: 'HomeItems',
				scrollable: false,
		 		itemTpl: Ext.create('Ext.XTemplate', 
					'<div class="home-item {cls} {[!values.available ? "unavailable" : ""]}">',
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