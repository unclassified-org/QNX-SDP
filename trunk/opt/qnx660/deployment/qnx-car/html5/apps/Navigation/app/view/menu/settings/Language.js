/**
 * The language settings menu
 * @author mlapierre
 *
 * $Id: Language.js 7957 2013-12-19 20:37:16Z nschultz@qnx.com $
 */
Ext.define('Navigation.view.menu.settings.Language', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuSettingsLanguage',

	config: {
		layout: 'fit',
		cls: 'menu settings',
		items: [
			{
				xtype: 'toolbar',
				cls: 'settings-header',
				title: 'LANGUAGE + VOICE OPTIONS',
				docked: 'top'
			},{
				xtype: 'formpanel',
				cls: 'settings-form',
				items: [
					{
						xtype: 'label',
						html: 'Select language:',
					},{
						xtype: 'button',
						cls: 'green',
						action: 'nav_language',
					},{
						xtype: 'label',
						html: 'Select a voice:',
					},{
						xtype: 'button',
						cls: 'green',
						action: 'nav_voice',
					},{
						xtype: 'button',
						cls: 'green',
						html: 'TEST',
						disabled: true
					}
				]
			}
		]
	},
});