/**
 * The controller responsible for the communication landing page.
 *
 * @author mlytvynyuk
 *
 * $Id: Home.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Communication.controller.Home', {
	extend: 'Ext.app.Controller',

	config: {
		refs: {
			index: 'homeView',
		},
		control: {
			'homeView > dataview': {
				itemtouchend: 'onItemTap'
			}
		},
	},

	/**
	 * Initializes the controller on app startup
	 */
	init: function() {
		this.getApplication().on({
			home_index: this.onHomeIndex,
			car_driving: this.onDrivingEvent,
			scope: this
		});
	},
	
	/**
	 * Shows the home view
	 */
	onHomeIndex: function() {
		Ext.Viewport.setActiveItem(this.getIndex());
	},
	
	/**
	 * Method called when an event related to the user's driving is fired
	 * @param e {Object} The event details
	 */
	onDrivingEvent: function(e) {
		//redraw the touch buttons for the new driving state
		Ext.getStore('HomeItems').each(function(record) {
			record.set('safe', !e.isDriving);
		}, this);

		// return to main screen when car start driving
		if(e && e.isDriving) {
			this.getApplication().fireEvent('menu_hide');
		}
	},
	
	/**
	 * Event handler triggered when home view items are tapped
	 * @param dv {Object} The dataview containing the item
	 * @param index {Number} The index of the tapped item
	 * @param item {Object} The item that was tapped
	 * @param e {Object} The triggered event
	 */
	onItemTap: function (dv, index, item, e) {
		var record = dv.getStore().getAt(index);
		if (record.get('safe') && record.get('available'))
		{
			this.getApplication().fireEvent(record.get('event'));
		}
	}
});
