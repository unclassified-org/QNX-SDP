/**
 * The language settings menu
 * @author mlapierre
 *
 * $Id: Map.js 5883 2013-03-08 20:47:20Z lgreenway@qnx.com $
 */
Ext.define('Navigation.view.menu.settings.Map', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuSettingsMap',
	
	config: {
		layout: 'fit',
		cls: 'menu settings',
		items: [
			{
				xtype: 'toolbar',
				cls: 'settings-header',
				title: 'MAP DISPLAY',
				docked: 'top'
			},{
				xtype: 'formpanel',
				cls: 'settings-form',
				items: [
					{
						xtype: 'label',
						html: 'Select map style:',
					},{
						xtype: 'button',
						cls: 'green',
						action: 'nav_mapStyle',
					},{
						xtype: 'checkboxfield',
						labelAlign: 'right',
						labelWidth: '80%',
						name: 'nav_turnrestrictions',
						label: 'Show Turn Restrictions',
					}
				]
			}
		]
	},
});