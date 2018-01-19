/**
 * The base class for menu lists.
 * @author mlapierre
 *
 * $Id: List.js 7263 2013-09-26 17:52:45Z nschultz@qnx.com $
 */
Ext.define('QnxCar.view.list.List', {
	extend: 'Ext.dataview.List',
	xtype: 'menuList',

	config: {
		cls: 'menu-list',
		pressedCls: 'menu-selected',
		selectedCls: '',
		variableHeights:true,
		// Will disable rendering all items and instead 
		// use a pool the size of the displayed items
		infinite:true,
		scrollToTopOnRefresh:false
	}
});