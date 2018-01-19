/**
 * The units settings menu
 * @author mlapierre
 *
 * $Id: Units.js 5883 2013-03-08 20:47:20Z lgreenway@qnx.com $
 */
Ext.define('Navigation.view.menu.settings.Units', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuSettingsUnits',
	
	config: {
		layout: 'fit',
		cls: 'menu settings',
		items: [
			{
				xtype: 'toolbar',
				cls: 'settings-header',
				title: 'UNIT OF MEASUREMENT',
				docked: 'top'
			},{
				xtype: 'formpanel',
				cls: 'settings-form',
				items: [
					{
						xtype: 'label',
						html: 'Select preferred unit of measurement:',
					},{
						xtype: 'button',
						cls: 'green',
						action: 'nav_unit',
					}
				]
			}
		]
	},
});