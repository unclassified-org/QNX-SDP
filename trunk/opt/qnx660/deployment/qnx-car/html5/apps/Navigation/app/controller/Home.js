/**
 * The controller responsible for the landing page.
 * @author mlapierre
 *
 * $Id: Home.js 6967 2013-08-13 14:34:34Z mlapierre@qnx.com $
 */
Ext.define('Navigation.controller.Home', {
	extend: 'Ext.app.Controller',

	config: {
		refs: {
			home: 'home',
		},
		control: {
			'home > dataview': {
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
		
		//auto detect webworks vs cordova
		if (typeof blackberry == 'object') {
			blackberry.event.addEventListener('reselect', this.onHomeIndex.bind(this));
		} else {
			document.addEventListener('reselect', this.onHomeIndex.bind(this));
		}
	},
	
	/**
	 * Shows the home view
	 */
	onHomeIndex: function() {
		Ext.Viewport.setActiveItem(this.getHome());
	},
	
	/**
	 * Method called when an event related to the user's driving is fired
	 * @param e {Object} The event details
	 */
	onDrivingEvent: function(e) {
		//redraw the touch buttons for the new driving state
		Ext.getStore('HomeItems').each(function(record) {
			record.setDriving(e.isDriving);
		}, this);		
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
		this.getApplication().fireEvent(record.get('event'));
	},
});
