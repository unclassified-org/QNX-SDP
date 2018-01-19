/**
 * Base component all other cards are based on
 * @author dkerr
 *
 * $Id: BaseCard.js 7889 2013-12-13 18:53:01Z mlapierre@qnx.com $
 */
Ext.define('AppSection.view.BaseCard', {
	extend: 'Ext.Panel',
	xtype: 'base_card',

	requires: [
		'Ext.dataview.DataView'
	],

	config: {
		layout: 'fit',
		store: "",
		items: [
			{
				xtype: 'dataview',
				scrollable: {
					direction: 'vertical',
					directionLock: true,
				},
				itemTpl: Ext.create('Ext.XTemplate',
					'<div class="home-item {[values.status == "locked"? "disabled" : ""]}">',
					'<img src="platform:///apps{[values.icon + "?" + new Date().getTime()]}">',
					'<h3>{name}</h3>',
					'</div>',
					{
						compiled: true
					}
				)
			}
		]
	},

	/**
	 * Function hook, will be invoked when store change on main component
	 * @param newValue {Object} - new value
	 * @param oldValue {Object} - previous value
	 * */
	updateStore: function (newValue, oldValue) {
			// set the store on dataview
			this.getItems().items[0].setStore(newValue);
	}
});

