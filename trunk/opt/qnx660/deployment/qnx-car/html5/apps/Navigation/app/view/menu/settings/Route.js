/**
 * The route settings menu
 * @author mlapierre
 *
 * $Id: Route.js 5883 2013-03-08 20:47:20Z lgreenway@qnx.com $
 */
Ext.define('Navigation.view.menu.settings.Route', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuSettingsRoute',
	
	config: {
		layout: 'fit',
		cls: 'menu settings',
		items: [
			{
				xtype: 'toolbar',
				cls: 'settings-header',
				title: 'ROUTE PREFERENCES',
				docked: 'top'
			},{
				xtype: 'formpanel',
				cls: 'settings-form',
				items: [
					{
						xtype: 'label',
						html: 'Select a route preference:',
					},{
						xtype: 'button',
						cls: 'green',
						action: 'nav_routePreference',
					},{
						xtype: 'label',
						html: 'Avoid the following:',
					},{
						layout: 'hbox',
						items: [
							{
								//left column options
								layout: 'vbox',
								defaults: {
									xtype: 'checkboxfield',
									labelAlign: 'right',
									labelWidth: '80%',
								},
								items: [
									{
							            name: 'nav_motorways',
							            label: 'Motorways',
									},{
							            name: 'nav_ferries',
							            label: 'Ferries',
									},{
							            name: 'nav_specialchargeroads',
							            label: 'Special Charge Roads',
									},{
							            name: 'nav_tollroads',
							            label: 'Toll Roads',
									},{
							            name: 'nav_tunnels',
							            label: 'Tunnels',
									}
								]
							},{
								//right column options
								layout: 'vbox',
								defaults: {
									xtype: 'checkboxfield',
									labelAlign: 'right',
									labelWidth: '80%',
								},
								items: [
									{
							            name: 'nav_cartrains',
							            label: 'Car Trains',
									},{
							            name: 'nav_seasonalroads',
							            label: 'Seasonal Roads',
									},{
							            name: 'nav_timerestrictedroads',
							            label: 'Time Restricted Roads',
									},{
							            name: 'nav_unpavedroads',
							            label: 'Unpaved Roads',
									},{
							            name: 'nav_inprogressroads',
							            label: 'In-Progress Roads',
									}
								]
							}
						]
					}
				]
			}
		]
	},
});