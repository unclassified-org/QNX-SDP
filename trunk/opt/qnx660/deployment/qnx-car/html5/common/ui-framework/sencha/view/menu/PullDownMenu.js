/**
 * The common pull-down menu view.
 * @author lgreenway
 *
 * $Id: PullDownMenu.js 5817 2013-02-13 21:45:57Z lgreenway@qnx.com $
 */
Ext.define('QnxCar.view.menu.PullDownMenu', {
	extend: 'Ext.Panel',
	xtype: 'menuView',

	requires: [
		'QnxCar.view.menu.HideButton',
	],

	config: {
		zIndex: 6,
		cls: 'menu pull-down-menu',
		enter: 'top',
		exit: 'top',
		modal: false,
	},
	
	initialize: function() {
		this.callParent();
		
		this.add(Ext.create('QnxCar.view.menu.HideButton'));
	},

	/**
	 * @override
	 * Adds the main-menu-show class to this container.
	 */
	show: function() {
		this.element.addCls("show");
	},

	/**
	 * @override
	 * Removes the main-menu-show class to this container.
	 */
	hide: function() {
		this.element.removeCls("show");
	},

	/**
	 * @override
	 * Returns `true` if this Component is currently hidden.
	 * @return {Boolean} `true` if currently hidden.
	 */
	isHidden: function() {
		return (!this.element.hasCls("show"));
	}
});