/**
 * The pull-down menu hide button.
 * @author mlapierre
 *
 * $Id: HideButton.js 5762 2013-01-29 21:23:21Z lgreenway@qnx.com $
 */
Ext.define('QnxCar.view.menu.HideButton', {
	extend: 'Ext.Container',
	xtype: 'menuHideButton',

	config: {
		cls: 'menu-hide',
		bottom: 0,
		zIndex: 10,
	},
});