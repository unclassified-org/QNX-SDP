/**
 * The mask used for the QnxCar.view.menu.AbstractMenu component to
 * fade it out if another menu is added to the QnxCar.view.menu.StackedMenu. 
 * @author mlapierre
 *
 * $Id: Mask.js 5762 2013-01-29 21:23:21Z lgreenway@qnx.com $
 */
Ext.define('QnxCar.view.menu.Mask', {
	extend: 'Ext.Mask',
	xtype: 'menuMask',

	config: {
		hiddenCls: 'hidden',
		showAnimation: {
			type: 'fadeIn',
			duration: 300
		},
		hideAnimation: {
			type: 'fadeOut',
			duration: 300
		}
	},
});